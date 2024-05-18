import type { NextPage } from 'next';
import MetaTags from '@components/Common/MetaTags';
import NotLoggedIn from '@components/Shared/NotLoggedIn';
import { APP_NAME } from '@good/data/constants';
import { PAGEVIEW } from '@good/data/tracking';
import { Leafwatch } from '@helpers/leafwatch';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { NotificationFeedType } from 'src/enums';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import FeedType from './FeedType';
import List from './List';
import Settings from './Settings';
import Sidebar from '../Home/Sidebar';
import Link from 'next/link';
import { ArrowLeftIcon, CogIcon } from '@heroicons/react/24/solid';

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
    <>
      <MetaTags title={`Notifications • ${APP_NAME}`} />
      <div className="flex grow justify-center px-0 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl space-y-3">
          <div className="flex items-center justify-between bg-black p-4 text-white">
            <div className="flex items-center">
              <Link href="/" passHref>
                <ArrowLeftIcon className="h-8 w-8 cursor-pointer text-white" />
              </Link>
              <div className="ml-2">
                <h2 className="text-lg font-semibold">Notifications</h2>
              </div>
            </div>
            <Settings />
          </div>
          <div className="flex flex-wrap justify-between gap-3 pb-2">
            <FeedType feedType={feedType} />
          </div>
          <List feedType={feedType} />
        </div>
        <div className="hidden lg:block lg:w-1/3">
          <Sidebar />
        </div>
      </div>
    </>
  );
};

export default Notification;
