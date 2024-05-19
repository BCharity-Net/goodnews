import type { FC } from 'react';

import SignupCard from '@components/Shared/Auth/SignupCard';
import Footer from '@components/Shared/Footer';
import { memo } from 'react';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import EnableLensManager from './EnableLensManager';
import GoodMembershipNft from './GoodMembershipNft';
import SetProfile from './SetProfile';
import StaffPicks from './StaffPicks';
import WhoToFollow from './WhoToFollow';

const Sidebar: FC = () => {
  const { currentProfile } = useProfileStore();
  const loggedInWithProfile = Boolean(currentProfile);
  const loggedOut = !loggedInWithProfile;

  return (
    <>
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
    </>
  );
};

export default memo(Sidebar);
