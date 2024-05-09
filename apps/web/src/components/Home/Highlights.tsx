import type { AnyPublication, FeedHighlightsRequest } from '@good/lens';
import type { FC } from 'react';

import QueuedPublication from '@components/Publication/QueuedPublication';
import SinglePublication from '@components/Publication/SinglePublication';
import PublicationsShimmer from '@components/Shared/Shimmer/PublicationsShimmer';
import { LimitType, useFeedHighlightsQuery } from '@good/lens';
import { OptmisticPublicationType } from '@good/types/enums';
import { Card, EmptyState, ErrorMessage } from '@good/ui';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import { Virtuoso } from 'react-virtuoso';
import { useImpressionsStore } from 'src/store/non-persisted/useImpressionsStore';
import { useTipsStore } from 'src/store/non-persisted/useTipsStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import { useTransactionStore } from 'src/store/persisted/useTransactionStore';

const Highlights: FC = () => {
  const { currentProfile } = useProfileStore();
  const { txnQueue } = useTransactionStore();
  const { fetchAndStoreViews } = useImpressionsStore();
  const { fetchAndStoreTips } = useTipsStore();

  // Variables
  const request: FeedHighlightsRequest = {
    limit: LimitType.TwentyFive,
    where: { for: currentProfile?.id }
  };

  const { data, error, fetchMore, loading } = useFeedHighlightsQuery({
    onCompleted: async ({ feedHighlights }) => {
      const ids = feedHighlights?.items?.map((p) => p.id) || [];
      await fetchAndStoreViews(ids);
      await fetchAndStoreTips(ids);
    },
    variables: { request }
  });

  const publications = data?.feedHighlights?.items;
  const pageInfo = data?.feedHighlights?.pageInfo;
  const hasMore = pageInfo?.next;

  const onEndReached = async () => {
    if (!hasMore) {
      return;
    }

    const { data } = await fetchMore({
      variables: { request: { ...request, cursor: pageInfo?.next } }
    });
    const ids = data?.feedHighlights?.items?.map((p) => p.id) || [];
    await fetchAndStoreViews(ids);
    await fetchAndStoreTips(ids);
  };

  if (loading) {
    return <PublicationsShimmer />;
  }

  if (publications?.length === 0) {
    return (
      <EmptyState
        icon={<LightBulbIcon className="size-8" />}
        message="No posts yet!"
      />
    );
  }

  if (error) {
    return <ErrorMessage error={error} title="Failed to load highlights" />;
  }

  return (
    <>
      {txnQueue.map((txn) =>
        txn?.type === OptmisticPublicationType.Post ? (
          <QueuedPublication key={txn.txId} txn={txn} />
        ) : null
      )}
      <Card>
        <Virtuoso
          className="virtual-divider-list-window"
          computeItemKey={(index, publication) => `${publication.id}-${index}`}
          data={publications}
          endReached={onEndReached}
          itemContent={(index, publication) => {
            return (
              <SinglePublication
                isFirst={index === 0}
                isLast={index === (publications?.length || 0) - 1}
                publication={publication as AnyPublication}
              />
            );
          }}
          useWindowScroll
        />
      </Card>
    </>
  );
};

export default Highlights;
