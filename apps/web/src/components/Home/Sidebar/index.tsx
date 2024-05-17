import React, { FC } from 'react';
import { memo } from 'react';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import EnableLensManager from './EnableLensManager';
import GoodMembershipNft from './GoodMembershipNft';
import SetProfile from './SetProfile';
import StaffPicks from './StaffPicks';
import WhoToFollow from './WhoToFollow';
import SignupCard from '@components/Shared/Auth/SignupCard';
import Footer from '@components/Shared/Footer';

const Sidebar: FC = () => {
  const { currentProfile } = useProfileStore();
  const loggedInWithProfile = Boolean(currentProfile);
  const loggedOut = !loggedInWithProfile;

  return (
    <div className="max-w-md lg:max-w-lg"> {/* Constrain the maximum width */}
      {/* <Gitcoin /> */}
      {loggedOut && <SignupCard />}
      {loggedInWithProfile && <GoodMembershipNft />}
      {/* Onboarding steps */}
      {loggedInWithProfile && (
        <>
          <EnableLensManager />
          <SetProfile />
        </>
      )}
      {/* Recommendations */}
      <StaffPicks />
      {loggedInWithProfile && <WhoToFollow />}
      <Footer />
    </div>
  );
};

export default memo(Sidebar);
