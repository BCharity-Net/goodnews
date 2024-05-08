import type { NextPage } from 'next';

import MetaTags from '@components/Common/MetaTags';
import NotLoggedIn from '@components/Shared/NotLoggedIn';
import { Leafwatch } from '@helpers/leafwatch';
import { APP_NAME } from '@good/data/constants';
import { PAGEVIEW } from '@good/data/tracking';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { NotificationFeedType } from 'src/enums';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import FeedType from './FeedType';
import List from './List';
import Settings from './Settings';

const Notification: NextPage = () => {
  const {
    query: { type }
  } = useRouter();
  const { currentProfile } = useProfileStore();

  useEffect(() => {
    Leafwatch.track(PAGEVIEW, { page: 'notifications' });
  }, []);

  const lowerCaseNotificationFeedType = [
    NotificationFeedType.All.toLowerCase(),
    NotificationFeedType.Mentions.toLowerCase(),
    NotificationFeedType.Comments.toLowerCase(),
    NotificationFeedType.Likes.toLowerCase(),
    NotificationFeedType.Collects.toLowerCase()
  ];

  const feedType = type
    ? lowerCaseNotificationFeedType.includes(type as string)
      ? type.toString().toUpperCase()
      : NotificationFeedType.All
    : NotificationFeedType.All;

  if (!currentProfile) {
    return <NotLoggedIn />;
  }

  return (
    <div className="flex grow justify-center px-0 py-8 sm:px-6 lg:px-8">
      <MetaTags title={`Notifications • ${APP_NAME}`} />
      <div className="w-full max-w-4xl space-y-3">
        <div className="flex flex-wrap justify-between gap-3 pb-2">
          <FeedType feedType={feedType} />
          <Settings />
        </div>
        <List feedType={feedType} />
      </div>
    </div>
  );
};

export default Notification;
