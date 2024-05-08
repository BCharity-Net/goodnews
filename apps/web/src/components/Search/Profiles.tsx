import type { Profile, ProfileSearchRequest } from '@good/lens';
import type { FC } from 'react';

import UserProfilesShimmer from '@components/Shared/Shimmer/UserProfilesShimmer';
import UserProfile from '@components/Shared/UserProfile';
import { UsersIcon } from '@heroicons/react/24/outline';
import { ProfileLinkSource } from '@good/data/tracking';
import {
  CustomFiltersType,
  LimitType,
  useSearchProfilesQuery
} from '@good/lens';
import { Card, EmptyState, ErrorMessage } from '@good/ui';
import { Virtuoso } from 'react-virtuoso';

interface ProfilesProps {
  query: string;
}

const Profiles: FC<ProfilesProps> = ({ query }) => {
  // Variables
  const request: ProfileSearchRequest = {
    limit: LimitType.TwentyFive,
    query,
    where: { customFilters: [CustomFiltersType.Gardeners] }
  };

  const { data, error, fetchMore, loading } = useSearchProfilesQuery({
    skip: !query,
    variables: { request }
  });

  const search = data?.searchProfiles;
  const profiles = search?.items;
  const pageInfo = search?.pageInfo;
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
    return <UserProfilesShimmer isBig />;
  }

  if (profiles?.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon className="size-8" />}
        message={
          <span>
            No profiles for <b>&ldquo;{query}&rdquo;</b>
          </span>
        }
      />
    );
  }

  if (error) {
    return <ErrorMessage error={error} title="Failed to load profiles" />;
  }

  return (
    <Virtuoso
      className="[&>div>div]:space-y-3"
      computeItemKey={(index, profile) => `${profile.id}-${index}`}
      data={profiles}
      endReached={onEndReached}
      itemContent={(_, profile) => {
        return (
          <Card className="p-5">
            <UserProfile
              hideFollowButton
              hideUnfollowButton
              isBig
              profile={profile as Profile}
              showBio
              source={ProfileLinkSource.Search}
            />
          </Card>
        );
      }}
      useWindowScroll
    />
  );
};

export default Profiles;
