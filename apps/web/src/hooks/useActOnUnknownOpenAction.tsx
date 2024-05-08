import type { ActOnOpenActionLensManagerRequest } from '@good/lens';
import type { Address } from 'viem';

import errorToast from '@helpers/errorToast';
import { LensHub } from '@good/abis';
import { LENS_HUB } from '@good/data/constants';
import checkDispatcherPermissions from '@good/helpers/checkDispatcherPermissions';
import getSignature from '@good/helpers/getSignature';
import {
  useActOnOpenActionMutation,
  useBroadcastOnchainMutation,
  useCreateActOnOpenActionTypedDataMutation
} from '@good/lens';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNonceStore } from 'src/store/non-persisted/useNonceStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import { useSignTypedData, useWriteContract } from 'wagmi';

import useHandleWrongNetwork from './useHandleWrongNetwork';

interface CreatePublicationProps {
  onSuccess?: () => void;
  signlessApproved?: boolean;
  successToast?: string;
}

const useActOnUnknownOpenAction = ({
  onSuccess,
  signlessApproved = false,
  successToast
}: CreatePublicationProps) => {
  const { currentProfile } = useProfileStore();
  const {
    decrementLensHubOnchainSigNonce,
    incrementLensHubOnchainSigNonce,
    lensHubOnchainSigNonce
  } = useNonceStore();
  const [isLoading, setIsLoading] = useState(false);
  const handleWrongNetwork = useHandleWrongNetwork();

  const { canBroadcast, canUseLensManager } =
    checkDispatcherPermissions(currentProfile);

  const onError = (error?: any) => {
    setIsLoading(false);
    errorToast(error);
  };

  const onCompleted = (
    __typename?: 'LensProfileManagerRelayError' | 'RelayError' | 'RelaySuccess'
  ) => {
    if (
      __typename === 'RelayError' ||
      __typename === 'LensProfileManagerRelayError'
    ) {
      return;
    }

    onSuccess?.();
    setIsLoading(false);
    toast.success(successToast || 'Success!');
  };

  const { signTypedDataAsync } = useSignTypedData({ mutation: { onError } });
  const { writeContractAsync } = useWriteContract({
    mutation: {
      onError: (error: Error) => {
        onError(error);
        decrementLensHubOnchainSigNonce();
      },
      onSuccess: () => {
        onCompleted();
        incrementLensHubOnchainSigNonce();
      }
    }
  });

  const write = async ({ args }: { args: any }) => {
    return await writeContractAsync({
      abi: LensHub,
      address: LENS_HUB,
      args,
      functionName: 'act'
    });
  };

  const [broadcastOnchain] = useBroadcastOnchainMutation({
    onCompleted: ({ broadcastOnchain }) =>
      onCompleted(broadcastOnchain.__typename)
  });

  const [createActOnOpenActionTypedData] =
    useCreateActOnOpenActionTypedDataMutation({
      onCompleted: async ({ createActOnOpenActionTypedData }) => {
        const { id, typedData } = createActOnOpenActionTypedData;
        await handleWrongNetwork();

        if (canBroadcast) {
          const signature = await signTypedDataAsync(getSignature(typedData));
          const { data } = await broadcastOnchain({
            variables: { request: { id, signature } }
          });
          if (data?.broadcastOnchain.__typename === 'RelayError') {
            return await write({ args: [typedData.value] });
          }
          incrementLensHubOnchainSigNonce();

          return;
        }

        return await write({ args: [typedData.value] });
      },
      onError
    });

  // Act
  const [actOnOpenAction] = useActOnOpenActionMutation({
    onCompleted: ({ actOnOpenAction }) =>
      onCompleted(actOnOpenAction.__typename),
    onError
  });

  // Act via Lens Manager
  const actViaLensManager = async (
    request: ActOnOpenActionLensManagerRequest
  ) => {
    const { data, errors } = await actOnOpenAction({ variables: { request } });

    if (errors?.toString().includes('has already acted on')) {
      return;
    }

    if (
      !data?.actOnOpenAction ||
      data?.actOnOpenAction.__typename === 'LensProfileManagerRelayError'
    ) {
      return await createActOnOpenActionTypedData({ variables: { request } });
    }
  };

  const actOnUnknownOpenAction = async ({
    address,
    data,
    publicationId
  }: {
    address: Address;
    data: string;
    publicationId: string;
  }) => {
    try {
      setIsLoading(true);

      const actOnRequest: ActOnOpenActionLensManagerRequest = {
        actOn: { unknownOpenAction: { address, data } },
        for: publicationId
      };

      if (canUseLensManager && signlessApproved) {
        return await actViaLensManager(actOnRequest);
      }

      return await createActOnOpenActionTypedData({
        variables: {
          options: { overrideSigNonce: lensHubOnchainSigNonce },
          request: actOnRequest
        }
      });
    } catch (error) {
      onError(error);
    }
  };

  return { actOnUnknownOpenAction, isLoading };
};

export default useActOnUnknownOpenAction;
