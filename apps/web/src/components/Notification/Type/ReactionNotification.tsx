import type { ReactionNotification as TReactionNotification } from '@good/lens';
import type { FC } from 'react';

import Markup from '@components/Shared/Markup';
import { HeartIcon } from '@heroicons/react/24/outline';
import getPublicationData from '@good/helpers/getPublicationData';
import Link from 'next/link';
import plur from 'plur';
import usePushToImpressions from 'src/hooks/usePushToImpressions';

import AggregatedNotificationTitle from '../AggregatedNotificationTitle';
import { NotificationProfileAvatar } from '../Profile';

interface ReactionNotificationProps {
  notification: TReactionNotification;
}

const ReactionNotification: FC<ReactionNotificationProps> = ({
  notification
}) => {
  const metadata = notification?.publication.metadata;
  const filteredContent = getPublicationData(metadata)?.content || '';
  const reactions = notification?.reactions;
  const firstProfile = reactions?.[0]?.profile;
  const length = reactions.length - 1;
  const moreThanOneProfile = length > 1;

  const text = moreThanOneProfile
    ? `and ${length} ${plur('other', length)} liked your`
    : 'liked your';
  const type = notification?.publication.__typename;

  usePushToImpressions(notification.publication.id);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <HeartIcon className="size-6" />
        <div className="flex items-center space-x-1">
          {reactions.slice(0, 10).map((reaction) => (
            <div key={reaction.profile.id}>
              <NotificationProfileAvatar profile={reaction.profile} />
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

export default ReactionNotification;
