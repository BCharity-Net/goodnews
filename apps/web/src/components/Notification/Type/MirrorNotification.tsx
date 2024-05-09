import type { MirrorNotification as TMirrorNotification } from '@good/lens';
import type { FC } from 'react';

import Markup from '@components/Shared/Markup';
import getPublicationData from '@good/helpers/getPublicationData';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import plur from 'plur';
import usePushToImpressions from 'src/hooks/usePushToImpressions';

import AggregatedNotificationTitle from '../AggregatedNotificationTitle';
import { NotificationProfileAvatar } from '../Profile';

interface MirrorNotificationProps {
  notification: TMirrorNotification;
}

const MirrorNotification: FC<MirrorNotificationProps> = ({ notification }) => {
  const metadata = notification?.publication.metadata;
  const filteredContent = getPublicationData(metadata)?.content || '';
  const mirrors = notification?.mirrors;
  const firstProfile = mirrors?.[0]?.profile;
  const length = mirrors.length - 1;
  const moreThanOneProfile = length > 1;

  const text = moreThanOneProfile
    ? `and ${length} ${plur('other', length)} mirrored your`
    : 'mirrored your';
  const type = notification?.publication.__typename;

  usePushToImpressions(notification.publication.id);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <ArrowsRightLeftIcon className="size-6" />
        <div className="flex items-center space-x-1">
          {mirrors.slice(0, 10).map((mirror) => (
            <div key={mirror.profile.id}>
              <NotificationProfileAvatar profile={mirror.profile} />
            </div>
          ))}
        </div>
      </div>
      <div className="ml-9">
        <AggregatedNotificationTitle
          firstProfile={firstProfile}
          linkToType={`/posts/${notification?.publication?.id}`}
          text={text}
          type={type}
        />
        <Link
          className="ld-text-gray-500 linkify mt-2 line-clamp-2"
          href={`/posts/${notification?.publication?.id}`}
        >
          <Markup mentions={notification.publication.profilesMentioned}>
            {filteredContent}
          </Markup>
        </Link>
      </div>
    </div>
  );
};

export default MirrorNotification;
