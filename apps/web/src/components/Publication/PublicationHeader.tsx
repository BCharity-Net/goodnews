import type { AnyPublication, FeedItem } from '@good/lens';
import type { FC } from 'react';

import PublicationProfile from '@components/Publication/PublicationProfile';
import { isMirrorPublication } from '@good/helpers/publicationHelpers';
import stopEventPropagation from '@good/helpers/stopEventPropagation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { usePublicationStore } from 'src/store/non-persisted/publication/usePublicationStore';

import PublicationMenu from './Actions/Menu';

interface PublicationHeaderProps {
  feedItem?: FeedItem;
  isNew?: boolean;
  publication: AnyPublication;
  quoted?: boolean;
}

const PublicationHeader: FC<PublicationHeaderProps> = ({
  feedItem,
  isNew = false,
  publication,
  quoted = false
}) => {
  const { setQuotedPublication } = usePublicationStore();

  const targetPublication = isMirrorPublication(publication)
    ? publication?.mirrorOn
    : publication;
  const rootPublication = feedItem ? feedItem?.root : targetPublication;
  const profile = feedItem ? rootPublication.by : targetPublication.by;
  const timestamp = feedItem
    ? rootPublication.createdAt
    : targetPublication.createdAt;

  return (
    <div
      className="flex w-full items-start justify-between"
      onClick={stopEventPropagation}
    >
      <PublicationProfile
        profile={profile}
        publicationId={targetPublication.id}
        source={targetPublication.publishedOn?.id}
        timestamp={timestamp}
      />
      {!publication.isHidden && !quoted ? (
        <PublicationMenu publication={targetPublication} />
      ) : (
        <div className="size-[30px]" />
      )}
      {quoted && isNew ? (
        <button
          aria-label="Remove Quote"
          className="rounded-full border p-1.5 hover:bg-gray-300/20"
          onClick={() => setQuotedPublication(null)}
          type="reset"
        >
          <XMarkIcon className="ld-text-gray-500 size-4" />
        </button>
      ) : null}
    </div>
  );
};

export default PublicationHeader;
