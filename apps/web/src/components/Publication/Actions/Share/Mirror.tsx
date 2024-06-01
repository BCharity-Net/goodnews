import type {
    MirrorablePublication,
    MomokaMirrorRequest,
    OnchainMirrorRequest
} from '@good/lens';
import type { OptimisticTransaction } from '@good/types/misc';
import type { Dispatch, FC, SetStateAction } from 'react';

import { useApolloClient } from '@apollo/client';
import { LensHub } from '@good/abis';
import { LENS_HUB } from '@good/data/constants';
import { Errors } from '@good/data/errors';
import { PUBLICATION } from '@good/data/tracking';
import checkDispatcherPermissions from '@good/helpers/checkDispatcherPermissions';
import getSignature from '@good/helpers/getSignature';
import {
    TriStateValue,
    useBroadcastOnchainMutation,
    useBroadcastOnMomokaMutation,
    useCreateMomokaMirrorTypedDataMutation,
    useCreateOnchainMirrorTypedDataMutation,
    useMirrorOnchainMutation,
    useMirrorOnMomokaMutation
} from '@good/lens';
import { OptmisticPublicationType } from '@good/types/enums';
import cn from '@good/ui/cn';
import { MenuItem } from '@headlessui/react';
import checkAndToastDispatcherError from '@helpers/checkAndToastDispatcherError';
import errorToast from '@helpers/errorToast';
import { Leafwatch } from '@helpers/leafwatch';
import hasOptimisticallyMirrored from '@helpers/optimistic/hasOptimisticallyMirrored';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { useCounter } from '@uidotdev/usehooks';
import { toast } from 'react-hot-toast';
import useHandleWrongNetwork from 'src/hooks/useHandleWrongNetwork';
import { useNonceStore } from 'src/store/non-persisted/useNonceStore';
import { useProfileStatus } from 'src/store/non-persisted/useProfileStatus';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import { useTransactionStore } from 'src/store/persisted/useTransactionStore';
import { useSignTypedData, useWriteContract } from 'wagmi';

interface MirrorProps {
  isLoading: boolean;
  publication: MirrorablePublication;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const Mirror: FC<MirrorProps> = ({ isLoading, publication, setIsLoading }) => {
  const { currentProfile } = useProfileStore();
  const { isSuspended } = useProfileStatus();
  const {
    decrementLensHubOnchainSigNonce,
    incrementLensHubOnchainSigNonce,
    lensHubOnchainSigNonce
  } = useNonceStore();
  const { addTransaction } = useTransactionStore();
  const hasMirrored =
    publication.operations.hasMirrored ||
    hasOptimisticallyMirrored(publication.id);

  const [shares, { increment }] = useCounter(
    publication.stats.mirrors + publication.stats.quotes
  );

  const handleWrongNetwork = useHandleWrongNetwork();
  const { cache } = useApolloClient();

  const { canBroadcast, canUseLensManager } =
    checkDispatcherPermissions(currentProfile);

  const generateOptimisticMirror = ({
    txHash,
    txId
  }: {
    txHash?: string;
    txId?: string;
  }): OptimisticTransaction => {
    return {
      mirrorOn: publication?.id,
      txHash,
      txId,
      type: OptmisticPublicationType.Mirror
    };
  };

  const updateCache = () => {
    cache.modify({
      fields: {
        operations: (existingValue) => {
          return { ...existingValue, hasMirrored: true };
        }
      },
      id: cache.identify(publication)
    });
    cache.modify({
      fields: { mirrors: () => shares + 1 },
      id: cache.identify(publication.stats)
    });
  };

  const onError = (error?: any) => {
    setIsLoading(false);
    errorToast(error);
  };

  const onCompleted = (
    __typename?:
      | 'CreateMomokaPublicationResult'
      | 'LensProfileManagerRelayError'
      | 'RelayError'
      | 'RelaySuccess'
  ) => {
    if (
      __typename === 'RelayError' ||
      __typename === 'LensProfileManagerRelayError'
    ) {
      return onError();
    }

    setIsLoading(false);
    increment();
    updateCache();
    toast.success('Post has been mirrored!');
    Leafwatch.track(PUBLICATION.MIRROR, { publication_id: publication.id });
  };

  const { signTypedDataAsync } = useSignTypedData({ mutation: { onError } });

  const { writeContractAsync } = useWriteContract({
    mutation: {
      onError: (error: Error) => {
        onError(error);
        decrementLensHubOnchainSigNonce();
      },
      onSuccess: (hash: string) => {
        addTransaction(generateOptimisticMirror({ txHash: hash }));
        incrementLensHubOnchainSigNonce();
        onCompleted();
      }
    }
  });

  const write = async ({ args }: { args: any[] }) => {
    return await writeContractAsync({
      abi: LensHub,
      address: LENS_HUB,
      args,
      functionName: 'mirror'
    });
  };

  const [broadcastOnMomoka] = useBroadcastOnMomokaMutation({
    onCompleted: ({ broadcastOnMomoka }) => {
      onCompleted(broadcastOnMomoka.__typename);
    },
    onError
  });

  const [broadcastOnchain] = useBroadcastOnchainMutation({
    onCompleted: ({ broadcastOnchain }) => {
      if (broadcastOnchain.__typename === 'RelaySuccess') {
        addTransaction(
          generateOptimisticMirror({ txId: broadcastOnchain.txId })
        );
      }
      onCompleted(broadcastOnchain.__typename);
    },
    onError
  });

  const typedDataGenerator = async (
    generatedData: any,
    isMomokaPublication = false
  ) => {
    const { id, typedData } = generatedData;
    await handleWrongNetwork();

    if (canBroadcast) {
      const signature = await signTypedDataAsync(getSignature(typedData));
      if (isMomokaPublication) {
        return await broadcastOnMomoka({
          variables: { request: { id, signature } }
        });
      }
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
  };

  // On-chain typed data generation
  const [createOnchainMirrorTypedData] =
    useCreateOnchainMirrorTypedDataMutation({
      onCompleted: async ({ createOnchainMirrorTypedData }) =>
        await typedDataGenerator(createOnchainMirrorTypedData),
      onError
    });

  // Momoka typed data generation
  const [createMomokaMirrorTypedData] = useCreateMomokaMirrorTypedDataMutation({
    onCompleted: async ({ createMomokaMirrorTypedData }) =>
      await typedDataGenerator(createMomokaMirrorTypedData, true),
    onError
  });

  // Onchain mutations
  const [mirrorOnchain] = useMirrorOnchainMutation({
    onCompleted: ({ mirrorOnchain }) => {
      if (mirrorOnchain.__typename === 'RelaySuccess') {
        addTransaction(generateOptimisticMirror({ txId: mirrorOnchain.txId }));
      }
      onCompleted(mirrorOnchain.__typename);
    },
    onError
  });

  // Momoka mutations
  const [mirrorOnMomoka] = useMirrorOnMomokaMutation({
    onCompleted: ({ mirrorOnMomoka }) => onCompleted(mirrorOnMomoka.__typename),
    onError
  });

  if (publication.operations.canMirror === TriStateValue.No) {
    return null;
  }

  const createOnMomka = async (request: MomokaMirrorRequest) => {
    const { data } = await mirrorOnMomoka({ variables: { request } });

    if (data?.mirrorOnMomoka?.__typename === 'LensProfileManagerRelayError') {
      const shouldProceed = checkAndToastDispatcherError(
        data.mirrorOnMomoka.reason
      );

      if (!shouldProceed) {
        return;
      }

      return await createMomokaMirrorTypedData({ variables: { request } });
    }
  };

  const createOnChain = async (request: OnchainMirrorRequest) => {
    const { data } = await mirrorOnchain({ variables: { request } });
    if (data?.mirrorOnchain.__typename === 'LensProfileManagerRelayError') {
      return await createOnchainMirrorTypedData({
        variables: {
          options: { overrideSigNonce: lensHubOnchainSigNonce },
          request
        }
      });
    }
  };

  const createMirror = async () => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    if (isSuspended) {
      return toast.error(Errors.Suspended);
    }

    try {
      setIsLoading(true);
      const request: MomokaMirrorRequest | OnchainMirrorRequest = {
        mirrorOn: publication?.id
      };

      if (publication.momoka?.proof) {
        if (canUseLensManager) {
          return await createOnMomka(request);
        }

        return await createMomokaMirrorTypedData({ variables: { request } });
      }

      if (canUseLensManager) {
        return await createOnChain(request);
      }

      return await createOnchainMirrorTypedData({
        variables: {
          options: { overrideSigNonce: lensHubOnchainSigNonce },
          request
        }
      });
    } catch (error) {
      onError(error);
    }
  };

  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { 'dropdown-active': focus },
          hasMirrored ? 'text-green-500' : '',
          'm-2 block cursor-pointer rounded-lg px-4 py-1.5 text-sm'
        )
      }
      disabled={isLoading}
      onClick={createMirror}
    >
      <div className="flex items-center space-x-2">
        <ArrowsRightLeftIcon className="size-4" />
        <div>{hasMirrored ? 'Mirror again' : 'Mirror'}</div>
      </div>
    </MenuItem>
  );
};

export default Mirror;
