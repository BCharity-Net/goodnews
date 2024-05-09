import type { AnyPublication, FeedItem, FeedRequest } from '@good/lens';
import type { FC } from 'react';
import type { StateSnapshot, VirtuosoHandle } from 'react-virtuoso';

import QueuedPublication from '@components/Publication/QueuedPublication';
import SinglePublication from '@components/Publication/SinglePublication';
import PublicationsShimmer from '@components/Shared/Shimmer/PublicationsShimmer';
import { GOOD_CURATED_ID } from '@good/data/constants';
import { FeedEventItemType, useFeedQuery } from '@good/lens';
import { OptmisticPublicationType } from '@good/types/enums';
import { Card, EmptyState, ErrorMessage } from '@good/ui';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { memo, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useImpressionsStore } from 'src/store/non-persisted/useImpressionsStore';
import { useTipsStore } from 'src/store/non-persisted/useTipsStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import { useTransactionStore } from 'src/store/persisted/useTransactionStore';

let virtuosoState: any = { ranges: [], screenTop: 0 };

const Timeline: FC = () => {
  const { currentProfile, fallbackToCuratedFeed } = useProfileStore();
  const { txnQueue } = useTransactionStore();
  const { fetchAndStoreViews } = useImpressionsStore();
  const { fetchAndStoreTips } = useTipsStore();
  const virtuoso = useRef<VirtuosoHandle>(null);

  // Variables
  const request: FeedRequest = {
    where: {
      feedEventItemTypes: [
        FeedEventItemType.Acted,
        FeedEventItemType.Collect,
        FeedEventItemType.Mirror,
        FeedEventItemType.Post,
        FeedEventItemType.Quote,
        FeedEventItemType.Reaction
      ],
      for: fallbackToCuratedFeed ? GOOD_CURATED_ID : currentProfile?.id
    }
  };

  const { data, error, fetchMore, loading } = useFeedQuery({
    fetchPolicy: 'cache-and-network',
    onCompleted: async ({ feed }) => {
      const ids =
        feed?.items?.flatMap((p) => {
          return [p.root.id].filter((id) => id);
        }) || [];
      await fetchAndStoreViews(ids);
      await fetchAndStoreTips(ids);
    },
    variables: { request }
  });

  const feed = data?.feed?.items.filter(
    (item) => item.root.__typename !== 'Comment'
  );
  const pageInfo = data?.feed?.pageInfo;
  const hasMore = pageInfo?.next;

  const onScrolling = (scrolling: boolean) => {
    if (!scrolling) {
      virtuoso?.current?.getState((state: StateSnapshot) => {
        virtuosoState = { ...state };
      });
    }
  };

  const onEndReached = async () => {
    if (!hasMore) {
      return;
    }

    const { data } = await fetchMore({
      variables: { request: { ...request, cursor: pageInfo?.next } }
    });
    const ids =
      data.feed?.items?.flatMap((p) => {
        return [p.root.id].filter((id) => id);
      }) || [];
    await fetchAndStoreViews(ids);
    await fetchAndStoreTips(ids);
  };

  if (loading) {
    return <PublicationsShimmer />;
  }

  if (feed?.length === 0) {
    return (
      <EmptyState
        icon={<UserGroupIcon className="size-8" />}
        message="No posts yet!"
      />
    );
  }

  if (error) {
    return <ErrorMessage error={error} title="Failed to load timeline" />;
  }

  return (
    <>
      {txnQueue.map((txn) =>
        txn?.type !== OptmisticPublicationType.Comment ? (
          <QueuedPublication key={txn.txId} txn={txn} />
        ) : null
      )}
      <Card>
        <Virtuoso
          className="virtual-divider-list-window"
          computeItemKey={(index, feedItem) => `${feedItem.id}-${index}`}
          data={feed}
          endReached={onEndReached}
          isScrolling={onScrolling}
          itemContent={(index, feedItem) => {
            return (
              <SinglePublication
                feedItem={feedItem as FeedItem}
                isFirst={index === 0}
                isLast={index === (feed?.length || 0) - 1}
                publication={feedItem.root as AnyPublication}
              />
            );
          }}
          ref={virtuoso}
          restoreStateFrom={
            virtuosoState.ranges.length === 0
              ? virtuosoState?.current?.getState(
                  (state: StateSnapshot) => state
                )
              : virtuosoState
          }
          useWindowScroll
        />
      </Card>
    </>
  );
};

export default memo(Timeline);
