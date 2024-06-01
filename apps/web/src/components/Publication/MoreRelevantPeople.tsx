import type { Profile } from '@good/lens';
import type { FC } from 'react';

import UserProfile from '@components/Shared/UserProfile';
import { ProfileLinkSource } from '@good/data/tracking';
import { Virtuoso } from 'react-virtuoso';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

interface MoreRelevantPeopleProps {
  profiles: Profile[];
}

const MoreRelevantPeople: FC<MoreRelevantPeopleProps> = ({ profiles }) => {
  const { currentProfile } = useProfileStore();

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Virtuoso
        className="virtual-profile-list"
        computeItemKey={(index, profile) => `${profile.id}-${index}`}
        // remove the first 5 profiles from the list because theabc are already shown in the sidebar
        data={profiles.slice(5)}
        itemContent={(_, profile) => {
          return (
            <div className="p-5">
              <UserProfile
                hideFollowButton={currentProfile?.id === profile.id}
                hideUnfollowButton={currentProfile?.id === profile.id}
                profile={profile as Profile}
                showBio
                showUserPreview={false}
                source={ProfileLinkSource.WhoToFollow}
              />
            </div>
          );
        }}
      />
    </div>
  );
};

export default MoreRelevantPeople;
