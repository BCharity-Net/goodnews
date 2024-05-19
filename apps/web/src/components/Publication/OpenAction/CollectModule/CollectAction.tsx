import type {
    ActOnOpenActionLensManagerRequest,
    ApprovedAllowanceAmountResult,
    LegacyCollectRequest,
    MirrorablePublication,
    OpenActionModule
} from '@good/lens';
import type { OptimisticTransaction } from '@good/types/misc';
import type { FC, ReactNode } from 'react';

import { useApolloClient } from '@apollo/client';
import AllowanceButton from '@components/Settings/Allowance/Button';
import LoginButton from '@components/Shared/LoginButton';
import NoBalanceError from '@components/Shared/NoBalanceError';
import FollowUnfollowButton from '@components/Shared/Profile/FollowUnfollowButton';
import { LensHub } from '@good/abis';
import { Errors } from '@good/data';
import { LENS_HUB } from '@good/data/constants';
import { PUBLICATION } from '@good/data/tracking';
import checkDispatcherPermissions from '@good/helpers/checkDispatcherPermissions';
import getCollectModuleData from '@good/helpers/getCollectModuleData';
import getOpenActionActOnKey from '@good/helpers/getOpenActionActOnKey';
import getSignature from '@good/helpers/getSignature';
import {
    useActOnOpenActionMutation,
    useApprovedModuleAllowanceAmountQuery,
    useBroadcastOnchainMutation,
    useCreateActOnOpenActionTypedDataMutation,
    useCreateLegacyCollectTypedDataMutation,
    useLegacyCollectMutation
} from '@good/lens';
import { OptmisticPublicationType } from '@good/types/enums';
import { Button, Spinner, WarningMessage } from '@good/ui';
import cn from '@good/ui/cn';
import errorToast from '@helpers/errorToast';
import getCurrentSession from '@helpers/getCurrentSession';
import { Leafwatch } from '@helpers/leafwatch';
import hasOptimisticallyCollected from '@helpers/optimistic/hasOptimisticallyCollected';
import { RectangleStackIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useHandleWrongNetwork from 'src/hooks/useHandleWrongNetwork';
import { useNonceStore } from 'src/store/non-persisted/useNonceStore';
import { useProfileRestriction } from 'src/store/non-persisted/useProfileRestriction';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import { useTransactionStore } from 'src/store/persisted/useTransactionStore';
import { formatUnits } from 'viem';
import {
    useAccount,
    useBalance,
    useSignTypedData,
    useWriteContract
} from 'wagmi';

interface CollectActionProps {
  buttonTitle?: string;
  className?: string;
  countOpenActions: number;
  forceShowCollect?: boolean;
  noBalanceErrorMessages?: ReactNode;
  onCollectSuccess?: () => void;
  openAction: OpenActionModule;
  publication: MirrorablePublication;
}

const CollectAction: FC<CollectActionProps> = ({
  buttonTitle = 'Collect now',
  className = '',
  countOpenActions,
  forceShowCollect = false,
  noBalanceErrorMessages,
  onCollectSuccess = () => {},
  openAction,
  publication
}) => {
  const { currentProfile } = useProfileStore();
  const { isSuspended } = useProfileRestriction();
  const {
    decrementLensHubOnchainSigNonce,
    incrementLensHubOnchainSigNonce,
    lensHubOnchainSigNonce
  } = useNonceStore();
  const { addTransaction, isFollowPending } = useTransactionStore();

  const { id: sessionProfileId } = getCurrentSession();

  const [isLoading, setIsLoading] = useState(false);
  const [allowed, setAllowed] = useState(true);
  const [hasActed, setHasActed] = useState(
    publication.operations.hasActed.value ||
      hasOptimisticallyCollected(publication.id)
  );

  const { address } = useAccount();
  const handleWrongNetwork = useHandleWrongNetwork();
  const { cache } = useApolloClient();

  // Lens manager
  const { canBroadcast, canUseLensManager } =
    checkDispatcherPermissions(currentProfile);

  const collectModule = getCollectModuleData(openAction as any);

  const endTimestamp = collectModule?.endsAt;
  const collectLimit = collectModule?.collectLimit;
  const amount = collectModule?.amount as number;
  const assetAddress = collectModule?.assetAddress as any;
  const assetDecimals = collectModule?.assetDecimals as number;
  const isAllCollected = collectLimit
    ? countOpenActions >= collectLimit
    : false;
  const isSaleEnded = endTimestamp
    ? new Date(endTimestamp).getTime() / 1000 < new Date().getTime() / 1000
    : false;
  const isLegacyCollectModule =
    openAction.__typename === 'LegacySimpleCollectModuleSettings' ||
    openAction.__typename === 'LegacyMultirecipientFeeCollectModuleSettings' ||
    openAction.__typename === 'LegacyFreeCollectModuleSettings' ||
    openAction.__typename === 'LegacyFeeCollectModuleSettings' ||
    openAction.__typename === 'LegacyLimitedFeeCollectModuleSettings' ||
    openAction.__typename === 'LegacyTimedFeeCollectModuleSettings' ||
    openAction.__typename === 'LegacyLimitedTimedFeeCollectModuleSettings';
  const isFreeCollectModule = !amount;
  const isSimpleFreeCollectModule =
    openAction.__typename === 'SimpleCollectOpenActionSettings';
  const isFollowersOnly = collectModule?.followerOnly;
  const isFollowedByMe = isFollowersOnly
    ? publication?.by.operations.isFollowedByMe.value
    : true;
  const isFollowFinalizedOnchain = isFollowersOnly
    ? !isFollowPending(publication.by.id)
    : true;

  const canUseManager =
    canUseLensManager && !isFollowersOnly && isFreeCollectModule;
  const canCollect = forceShowCollect
    ? true
    : !hasActed || (!isFreeCollectModule && !isSimpleFreeCollectModule);

  const generateOptimisticCollect = ({
    txHash,
    txId
  }: {
    txHash?: string;
    txId?: string;
  }): OptimisticTransaction => {
    return {
      collectOn: publication?.id,
      txHash,
      txId,
      type: OptmisticPublicationType.Collect
    };
  };

  const updateCache = () => {
    cache.modify({
      fields: {
        operations: (existingValue) => {
          return { ...existingValue, hasActed: { value: true } };
        }
      },
      id: cache.identify(publication)
    });
    cache.modify({
      fields: { countOpenActions: () => countOpenActions + 1 },
      id: cache.identify(publication.stats)
    });
  };

  const onError = (error: any) => {
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

    setHasActed(true);
    setIsLoading(false);
    onCollectSuccess?.();
    updateCache();
    toast.success('Collected successfully!');
    Leafwatch.track(PUBLICATION.COLLECT_MODULE.COLLECT, {
      amount,
      collect_module: openAction?.type,
      publication_id: publication?.id
    });
  };

  const { signTypedDataAsync } = useSignTypedData({ mutation: { onError } });
  const profileUserFunctionName = isLegacyCollectModule
    ? 'collectLegacy'
    : 'act';

  const { writeContractAsync } = useWriteContract({
    mutation: {
      onError: (error: Error) => {
        onError(error);
        decrementLensHubOnchainSigNonce();
      },
      onSuccess: (hash: string) => {
        addTransaction(generateOptimisticCollect({ txHash: hash }));
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
      functionName: profileUserFunctionName
    });
  };

  const { data: allowanceData, loading: allowanceLoading } =
    useApprovedModuleAllowanceAmountQuery({
      fetchPolicy: 'no-cache',
      onCompleted: ({ approvedModuleAllowanceAmount }) => {
        const allowedAmount = parseFloat(
          approvedModuleAllowanceAmount[0]?.allowance.value
        );
        setAllowed(allowedAmount > amount);
      },
      skip: !assetAddress || !sessionProfileId,
      variables: {
        request: {
          currencies: assetAddress,
          followModules: [],
          openActionModules: [openAction.type],
          referenceModules: []
        }
      }
    });

  const { data: balanceData } = useBalance({
    address,
    query: { refetchInterval: 2000 },
    token: assetAddress
  });

  let hasAmount = false;
  if (
    balanceData &&
    parseFloat(formatUnits(balanceData.value, assetDecimals)) < amount
  ) {
    hasAmount = false;
  } else {
    hasAmount = true;
  }

  const [broadcastOnchain] = useBroadcastOnchainMutation({
    onCompleted: ({ broadcastOnchain }) => {
      if (broadcastOnchain.__typename === 'RelaySuccess') {
        addTransaction(
          generateOptimisticCollect({ txId: broadcastOnchain.txId })
        );
      }
      onCompleted(broadcastOnchain.__typename);
    }
  });

  const typedDataGenerator = async (generatedData: any) => {
    const { id, typedData } = generatedData;
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
  };

  // Act Typed Data
  const [createActOnOpenActionTypedData] =
    useCreateActOnOpenActionTypedDataMutation({
      onCompleted: async ({ createActOnOpenActionTypedData }) =>
        await typedDataGenerator(createActOnOpenActionTypedData),
      onError
    });

  // Legacy Collect Typed Data
  const [createLegacyCollectTypedData] =
    useCreateLegacyCollectTypedDataMutation({
      onCompleted: async ({ createLegacyCollectTypedData }) =>
        await typedDataGenerator(createLegacyCollectTypedData),
      onError
    });

  // Act
  const [actOnOpenAction] = useActOnOpenActionMutation({
    onCompleted: ({ actOnOpenAction }) => {
      if (actOnOpenAction.__typename === 'RelaySuccess') {
        addTransaction(
          generateOptimisticCollect({ txId: actOnOpenAction.txId })
        );
      }
      onCompleted(actOnOpenAction.__typename);
    },
    onError
  });

  // Legacy Collect
  const [legacyCollect] = useLegacyCollectMutation({
    onCompleted: ({ legacyCollect }) => {
      if (legacyCollect.__typename === 'RelaySuccess') {
        addTransaction(generateOptimisticCollect({ txId: legacyCollect.txId }));
      }
      onCompleted(legacyCollect.__typename);
    },
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

  // Collect via Lens Manager
  const legacyCollectViaLensManager = async (request: LegacyCollectRequest) => {
    const { data, errors } = await legacyCollect({ variables: { request } });

    if (errors?.toString().includes('has already collected on')) {
      return;
    }

    if (
      !data?.legacyCollect ||
      data?.legacyCollect.__typename === 'LensProfileManagerRelayError'
    ) {
      return await createLegacyCollectTypedData({ variables: { request } });
    }
  };

  const createCollect = async () => {
    if (isSuspended) {
      return toast.error(Errors.Suspended);
    }

    try {
      setIsLoading(true);
      if (isLegacyCollectModule) {
        const legcayCollectRequest: LegacyCollectRequest = {
          on: publication?.id
        };

        if (canUseManager) {
          return await legacyCollectViaLensManager(legcayCollectRequest);
        }

        return await createLegacyCollectTypedData({
          variables: {
            options: { overrideSigNonce: lensHubOnchainSigNonce },
            request: legcayCollectRequest
          }
        });
      }

      const actOnRequest: ActOnOpenActionLensManagerRequest = {
        actOn: { [getOpenActionActOnKey(openAction.type)]: true },
        for: publication?.id
      };

      if (canUseManager) {
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

  if (!sessionProfileId) {
    return (
      <LoginButton
        className="mt-5 w-full justify-center"
        title="Login to Collect"
      />
    );
  }

  if (!canCollect) {
    return null;
  }

  if (isAllCollected || isSaleEnded) {
    return null;
  }

  if (allowanceLoading) {
    return (
      <div
        className={cn('shimmer mt-5 h-[34px] w-full rounded-full', className)}
      />
    );
  }

  if (!allowed) {
    return (
      <AllowanceButton
        allowed={allowed}
        className={cn('mt-5 w-full', className)}
        module={
          allowanceData
            ?.approvedModuleAllowanceAmount[0] as ApprovedAllowanceAmountResult
        }
        setAllowed={setAllowed}
        title="Allow collect module"
      />
    );
  }

  if (
    !hasAmount &&
    (openAction.__typename === 'SimpleCollectOpenActionSettings' ||
      openAction.__typename === 'LegacySimpleCollectModuleSettings' ||
      openAction.__typename === 'MultirecipientFeeCollectOpenActionSettings' ||
      openAction.__typename === 'LegacyMultirecipientFeeCollectModuleSettings')
  ) {
    return (
      <WarningMessage
        className="mt-5 w-full"
        message={
          <NoBalanceError
            errorMessage={noBalanceErrorMessages}
            moduleAmount={openAction.amount}
          />
        }
      />
    );
  }

  if (!isFollowedByMe) {
    return (
      <FollowUnfollowButton
        buttonClassName="w-full mt-5"
        followTitle="Follow to collect"
        profile={publication.by}
      />
    );
  }

  if (!isFollowFinalizedOnchain) {
    return (
      <Button className="mt-5 w-full" disabled outline>
        Follow finalizing onchain...
      </Button>
    );
  }

  return (
    <Button
      className={cn('mt-5 w-full justify-center', className)}
      disabled={isLoading}
      icon={
        isLoading ? (
          <Spinner size="xs" />
        ) : (
          <RectangleStackIcon className="size-4" />
        )
      }
      onClick={createCollect}
    >
      {buttonTitle}
    </Button>
  );
};

export default CollectAction;
