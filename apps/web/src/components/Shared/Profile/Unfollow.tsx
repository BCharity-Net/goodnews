import type { Profile, UnfollowRequest } from '@good/lens';
import type { OptimisticTransaction } from '@good/types/misc';
import type { FC } from 'react';

import errorToast from '@helpers/errorToast';
import { Leafwatch } from '@helpers/leafwatch';
import { LensHub } from '@good/abis';
import { Errors } from '@good/data';
import { LENS_HUB } from '@good/data/constants';
import { PROFILE } from '@good/data/tracking';
import checkDispatcherPermissions from '@good/helpers/checkDispatcherPermissions';
import getSignature from '@good/helpers/getSignature';
import {
  useBroadcastOnchainMutation,
  useCreateUnfollowTypedDataMutation,
  useUnfollowMutation
} from '@good/lens';
import { useApolloClient } from '@good/lens/apollo';
import { OptmisticPublicationType } from '@good/types/enums';
import { Button } from '@good/ui';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useHandleWrongNetwork from 'src/hooks/useHandleWrongNetwork';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';
import { useNonceStore } from 'src/store/non-persisted/useNonceStore';
import { useProfileRestriction } from 'src/store/non-persisted/useProfileRestriction';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import { useTransactionStore } from 'src/store/persisted/useTransactionStore';
import { useSignTypedData, useWriteContract } from 'wagmi';

interface UnfollowProps {
  buttonClassName: string;
  profile: Profile;
  small?: boolean;
  title: string;
}

const Unfollow: FC<UnfollowProps> = ({
  buttonClassName,
  profile,
  small = false,
  title
}) => {
  const { pathname } = useRouter();
  const { currentProfile } = useProfileStore();
  const { isSuspended } = useProfileRestriction();
  const { incrementLensHubOnchainSigNonce, lensHubOnchainSigNonce } =
    useNonceStore();
  const { setShowAuthModal } = useGlobalModalStateStore();
  const { addTransaction, isFollowPending } = useTransactionStore();

  const [isLoading, setIsLoading] = useState(false);
  const handleWrongNetwork = useHandleWrongNetwork();
  const { cache } = useApolloClient();

  const { canBroadcast, canUseLensManager } =
    checkDispatcherPermissions(currentProfile);

  const generateOptimisticUnfollow = ({
    txHash,
    txId
  }: {
    txHash?: string;
    txId?: string;
  }): OptimisticTransaction => {
    return {
      txHash,
      txId,
      type: OptmisticPublicationType.Unfollow,
      unfollowOn: profile.id
    };
  };

  const updateCache = () => {
    cache.modify({
      fields: {
        isFollowedByMe: (existingValue) => {
          return { ...existingValue, value: false };
        }
      },
      id: cache.identify(profile.operations)
    });
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

    updateCache();
    setIsLoading(false);
    toast.success('Unfollowed successfully!');
    Leafwatch.track(PROFILE.UNFOLLOW, { path: pathname, target: profile?.id });
  };

  const onError = (error: any) => {
    setIsLoading(false);
    errorToast(error);
  };

  const { signTypedDataAsync } = useSignTypedData({ mutation: { onError } });
  const { writeContractAsync } = useWriteContract({
    mutation: {
      onError,
      onSuccess: (hash: string) => {
        addTransaction(generateOptimisticUnfollow({ txHash: hash }));
        onCompleted();
      }
    }
  });

  const write = async ({ args }: { args: any[] }) => {
    return await writeContractAsync({
      abi: LensHub,
      address: LENS_HUB,
      args,
      functionName: 'unfollow'
    });
  };

  const [broadcastOnchain] = useBroadcastOnchainMutation({
    onCompleted: ({ broadcastOnchain }) => {
      if (broadcastOnchain.__typename === 'RelaySuccess') {
        addTransaction(
          generateOptimisticUnfollow({ txId: broadcastOnchain.txId })
        );
      }
      onCompleted(broadcastOnchain.__typename);
    }
  });
  const [createUnfollowTypedData] = useCreateUnfollowTypedDataMutation({
    onCompleted: async ({ createUnfollowTypedData }) => {
      const { id, typedData } = createUnfollowTypedData;
      const { idsOfProfilesToUnfollow, unfollowerProfileId } = typedData.value;
      const args = [unfollowerProfileId, idsOfProfilesToUnfollow];
      await handleWrongNetwork();

      if (canBroadcast) {
        const signature = await signTypedDataAsync(getSignature(typedData));
        const { data } = await broadcastOnchain({
          variables: { request: { id, signature } }
        });
        if (data?.broadcastOnchain.__typename === 'RelayError') {
          return await write({ args });
        }
        incrementLensHubOnchainSigNonce();

        return;
      }

      return await write({ args });
    },
    onError
  });

  const [unfollow] = useUnfollowMutation({
    onCompleted: ({ unfollow }) => {
      if (unfollow.__typename === 'RelaySuccess') {
        addTransaction(generateOptimisticUnfollow({ txId: unfollow.txId }));
      }
      onCompleted(unfollow.__typename);
    },
    onError
  });

  const unfollowViaLensManager = async (request: UnfollowRequest) => {
    const { data } = await unfollow({ variables: { request } });
    if (data?.unfollow?.__typename === 'LensProfileManagerRelayError') {
      return await createUnfollowTypedData({ variables: { request } });
    }
  };

  const createUnfollow = async () => {
    if (!currentProfile) {
      setShowAuthModal(true);
      return;
    }

    if (isSuspended) {
      return toast.error(Errors.Suspended);
    }

    try {
      setIsLoading(true);
      const request: UnfollowRequest = { unfollow: [profile?.id] };

      if (canUseLensManager) {
        return await unfollowViaLensManager(request);
      }

      return await createUnfollowTypedData({
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
    <Button
      aria-label={title}
      className={buttonClassName}
      disabled={isLoading || isFollowPending(profile.id)}
      onClick={createUnfollow}
      size={small ? 'sm' : 'md'}
    >
      {title}
    </Button>
  );
};

export default Unfollow;
