import type { Profile, ProfileMentioned } from '@good/lens';
import type { FC } from 'react';

import UserProfileShimmer from '@components/Shared/Shimmer/UserProfileShimmer';
import UserProfile from '@components/Shared/UserProfile';
import { ProfileLinkSource } from '@good/data/tracking';
import { useProfilesQuery } from '@good/lens';
import { Card, ErrorMessage } from '@good/ui';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

interface RelevantPeopleProps {
  profilesMentioned: ProfileMentioned[];
}

const RelevantPeople: FC<RelevantPeopleProps> = ({ profilesMentioned }) => {
  const { currentProfile } = useProfileStore();
  const profileIds = profilesMentioned.map(
    (profile) => profile.snapshotHandleMentioned.linkedTo?.nftTokenId
  );

  const { data, error, loading } = useProfilesQuery({
    skip: profileIds.length <= 0,
    variables: { request: { where: { profileIds } } }
  });

  if (profileIds.length <= 0) {
    return null;
  }

  if (loading) {
    return (
      <Card as="aside" className="space-y-4 p-5">
        <UserProfileShimmer showFollowUnfollowButton />
        <UserProfileShimmer showFollowUnfollowButton />
        <UserProfileShimmer showFollowUnfollowButton />
        <UserProfileShimmer showFollowUnfollowButton />
        <UserProfileShimmer showFollowUnfollowButton />
      </Card>
    );
  }

  if (data?.profiles?.items?.length === 0) {
    return null;
  }

  return (
    <Card as="aside" className="space-y-4 p-5">
      <ErrorMessage error={error} title="Failed to load relevant people" />
      {data?.profiles?.items?.map((profile) => (
        <div className="truncate" key={profile?.id}>
          <UserProfile
            hideFollowButton={currentProfile?.id === profile.id}
            hideUnfollowButton={currentProfile?.id === profile.id}
            profile={profile as Profile}
            showUserPreview={false}
            source={ProfileLinkSource.RelevantPeople}
          />
        </div>
      ))}
    </Card>
  );
};

export default RelevantPeople;
