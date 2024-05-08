import type { QuoteNotification as TQuoteNotification } from '@good/lens';
import type { FC } from 'react';

import Markup from '@components/Shared/Markup';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import getPublicationData from '@good/helpers/getPublicationData';
import Link from 'next/link';
import usePushToImpressions from 'src/hooks/usePushToImpressions';

import AggregatedNotificationTitle from '../AggregatedNotificationTitle';
import { NotificationProfileAvatar } from '../Profile';

interface QuoteNotificationProps {
  notification: TQuoteNotification;
}

const QuoteNotification: FC<QuoteNotificationProps> = ({ notification }) => {
  const metadata = notification?.quote.metadata;
  const filteredContent = getPublicationData(metadata)?.content || '';
  const firstProfile = notification.quote.by;

  const text = 'quoted your';
  const type = notification.quote.quoteOn.__typename;

  usePushToImpressions(notification.quote.id);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <ChatBubbleBottomCenterTextIcon className="size-6" />
        <div className="flex items-center space-x-1">
          <NotificationProfileAvatar profile={firstProfile} />
        </div>
      </div>
      <div className="ml-9">
        <AggregatedNotificationTitle
          firstProfile={firstProfile}
          linkToType={`/posts/${notification?.quote?.id}`}
          text={text}
          type={type}
        />
        <Link
          className="ld-text-gray-500 linkify mt-2 line-clamp-2"
          href={`/posts/${notification?.quote?.id}`}
        >
          <Markup mentions={notification.quote.profilesMentioned}>
            {filteredContent}
          </Markup>
        </Link>
      </div>
    </div>
  );
};

export default QuoteNotification;
