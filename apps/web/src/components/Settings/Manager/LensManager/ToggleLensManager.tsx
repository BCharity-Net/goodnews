import type { FC } from 'react';

import IndexStatus from '@components/Shared/IndexStatus';
import { LensHub } from '@good/abis';
import { Errors } from '@good/data';
import { LENS_HUB } from '@good/data/constants';
import { SETTINGS } from '@good/data/tracking';
import checkDispatcherPermissions from '@good/helpers/checkDispatcherPermissions';
import getSignature from '@good/helpers/getSignature';
import {
  useBroadcastOnchainMutation,
  useCreateChangeProfileManagersTypedDataMutation
} from '@good/lens';
import { Button, Spinner } from '@good/ui';
import cn from '@good/ui/cn';
import errorToast from '@helpers/errorToast';
import { Leafwatch } from '@helpers/leafwatch';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useHandleWrongNetwork from 'src/hooks/useHandleWrongNetwork';
import { useNonceStore } from 'src/store/non-persisted/useNonceStore';
import { useProfileRestriction } from 'src/store/non-persisted/useProfileRestriction';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import { useSignTypedData, useWriteContract } from 'wagmi';

interface ToggleLensManagerProps {
  buttonSize?: 'sm';
}

const ToggleLensManager: FC<ToggleLensManagerProps> = ({
  buttonSize = 'md'
}) => {
  const { currentProfile } = useProfileStore();
  const { isSuspended } = useProfileRestriction();
  const {
    decrementLensHubOnchainSigNonce,
    incrementLensHubOnchainSigNonce,
    lensHubOnchainSigNonce
  } = useNonceStore();
  const [isLoading, setIsLoading] = useState(false);
  const handleWrongNetwork = useHandleWrongNetwork();

  const { canBroadcast, canUseSignless } =
    checkDispatcherPermissions(currentProfile);

  const onCompleted = (__typename?: 'RelayError' | 'RelaySuccess') => {
    if (__typename === 'RelayError') {
      return;
    }

    setIsLoading(false);
    toast.success('Profile updated successfully!');
    Leafwatch.track(SETTINGS.MANAGER.TOGGLE);
  };

  const onError = (error: any) => {
    setIsLoading(false);
    errorToast(error);
  };

  const { signTypedDataAsync } = useSignTypedData({ mutation: { onError } });
  const { data: writeHash, writeContractAsync } = useWriteContract({
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

  const write = async ({ args }: { args: any[] }) => {
    return await writeContractAsync({
      abi: LensHub,
      address: LENS_HUB,
      args,
      functionName: 'changeDelegatedExecutorsConfig'
    });
  };

  const [broadcastOnchain, { data: broadcastData }] =
    useBroadcastOnchainMutation({
      onCompleted: ({ broadcastOnchain }) =>
        onCompleted(broadcastOnchain.__typename)
    });
  const [createChangeProfileManagersTypedData] =
    useCreateChangeProfileManagersTypedDataMutation({
      onCompleted: async ({ createChangeProfileManagersTypedData }) => {
        const { id, typedData } = createChangeProfileManagersTypedData;
        const {
          approvals,
          configNumber,
          delegatedExecutors,
          delegatorProfileId,
          switchToGivenConfig
        } = typedData.value;
        const args = [
          delegatorProfileId,
          delegatedExecutors,
          approvals,
          configNumber,
          switchToGivenConfig
        ];
        await handleWrongNetwork();

        if (canBroadcast) {
          const signature = await signTypedDataAsync(getSignature(typedData));
          const { data } = await broadcastOnchain({
            variables: { request: { id, signature } }
          });
          if (data?.broadcastOnchain.__typename === 'RelayError') {
            return await write({ args });
          }

          return;
        }

        return await write({ args });
      },
      onError
    });

  const toggleDispatcher = async () => {
    if (isSuspended) {
      return toast.error(Errors.Suspended);
    }

    try {
      setIsLoading(true);
      return await createChangeProfileManagersTypedData({
        variables: {
          options: { overrideSigNonce: lensHubOnchainSigNonce },
          request: { approveSignless: canUseSignless ? false : true }
        }
      });
    } catch (error) {
      onError(error);
    }
  };

  const broadcastTxId =
    broadcastData?.broadcastOnchain.__typename === 'RelaySuccess' &&
    broadcastData.broadcastOnchain.txId;

  return writeHash || broadcastTxId ? (
    <div className="mt-2">
      <IndexStatus reload txHash={writeHash} txId={broadcastTxId} />
    </div>
  ) : (
    <Button
      className={cn({ 'text-sm': buttonSize === 'sm' }, 'mr-auto')}
      disabled={isLoading}
      icon={
        isLoading ? (
          <Spinner size="xs" variant={canUseSignless ? 'danger' : 'primary'} />
        ) : canUseSignless ? (
          <XMarkIcon className="size-4" />
        ) : (
          <CheckCircleIcon className="size-4" />
        )
      }
      onClick={toggleDispatcher}
      variant={canUseSignless ? 'danger' : 'primary'}
    >
      {canUseSignless ? 'Disable' : 'Enable'}
    </Button>
  );
};

export default ToggleLensManager;
