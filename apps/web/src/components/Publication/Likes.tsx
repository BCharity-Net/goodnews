import type { FC } from 'react';

import ProfileListShimmer from '@components/Shared/Shimmer/ProfileListShimmer';
import UserProfile from '@components/Shared/UserProfile';
import { ProfileLinkSource } from '@good/data/tracking';
import {
    LimitType,
    useWhoReactedPublicationQuery,
    type Profile,
    type WhoReactedPublicationRequest
} from '@good/lens';
import { Card, EmptyState, ErrorMessage } from '@good/ui';
import { ArrowLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Virtuoso } from 'react-virtuoso';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

interface LikesProps {
  publicationId: string;
}

const Likes: FC<LikesProps> = ({ publicationId }) => {
  const { currentProfile } = useProfileStore();

  // Variables
  const request: WhoReactedPublicationRequest = {
    for: publicationId,
    limit: LimitType.TwentyFive
  };

  const { data, error, fetchMore, loading } = useWhoReactedPublicationQuery({
    skip: !publicationId,
    variables: { request }
  });

  const profiles = data?.whoReactedPublication?.items;
  const pageInfo = data?.whoReactedPublication?.pageInfo;
  const hasMore = pageInfo?.next;

  const onEndReached = async () => {
    if (!hasMore) {
      return;
    }

    await fetchMore({
      variables: { request: { ...request, cursor: pageInfo?.next } }
    });
  };

  if (loading) {
    return <ProfileListShimmer />;
  }

  if (profiles?.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          icon={<HeartIcon className="size-8" />}
          message="No likes."
        />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load likes"
      />
    );
  }

  return (
    <Card>
      <div className="flex items-center space-x-3 p-5">
        <Link href={`/posts/${publicationId}`}>
          <ArrowLeftIcon className="size-5" />
        </Link>
        <b className="text-lg">Liked by</b>
      </div>
      <div className="divider" />
      <Virtuoso
        className="virtual-divider-list-window"
        computeItemKey={(index, like) => `${like.profile.id}-${index}`}
        data={profiles}
        endReached={onEndReached}
        itemContent={(_, like) => {
          return (
            <div className="p-5">
              <UserProfile
                hideFollowButton={currentProfile?.id === like.profile.id}
                hideUnfollowButton={currentProfile?.id === like.profile.id}
                profile={like.profile as Profile}
                showBio
                showUserPreview={false}
                source={ProfileLinkSource.Likes}
              />
            </div>
          );
        }}
        useWindowScroll
      />
    </Card>
  );
};

export default Likes;
