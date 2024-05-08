import type { Notification } from '@good/lens';
import type { FC } from 'react';

import { BrowserPush } from '@helpers/browserPush';
import getCurrentSession from '@helpers/getCurrentSession';
import getPushNotificationData from '@helpers/getPushNotificationData';
import {
  useNewNotificationSubscriptionSubscription,
  useUserSigNoncesSubscriptionSubscription
} from '@good/lens';
import { useEffect } from 'react';
import { useNonceStore } from 'src/store/non-persisted/useNonceStore';
import { useNotificationStore } from 'src/store/persisted/useNotificationStore';
import { useAccount } from 'wagmi';

const LensSubscriptionsProvider: FC = () => {
  const { setLatestNotificationId } = useNotificationStore();
  const { setLensHubOnchainSigNonce } = useNonceStore();
  const { address } = useAccount();
  const { id: sessionProfileId } = getCurrentSession();
  const canUseSubscriptions = Boolean(sessionProfileId) && address;

  // Begin: New Notification
  const { data: newNotificationData } =
    useNewNotificationSubscriptionSubscription({
      skip: !canUseSubscriptions,
      variables: { for: sessionProfileId }
    });

  useEffect(() => {
    const notification = newNotificationData?.newNotification as Notification;

    if (notification) {
      if (notification && getPushNotificationData(notification)) {
        const notify = getPushNotificationData(notification);
        BrowserPush.notify({ title: notify?.title || '' });
      }
      setLatestNotificationId(notification?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newNotificationData]);
  // End: New Notification

  // Begin: User Sig Nonces
  const { data: userSigNoncesData } = useUserSigNoncesSubscriptionSubscription({
    skip: !canUseSubscriptions,
    variables: { address }
  });

  useEffect(() => {
    const userSigNonces = userSigNoncesData?.userSigNonces;

    if (userSigNonces) {
      setLensHubOnchainSigNonce(userSigNonces.lensHubOnchainSigNonce);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSigNoncesData]);
  // End: User Sig Nonces

  return null;
};

export default LensSubscriptionsProvider;
