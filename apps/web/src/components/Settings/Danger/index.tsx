import type { NextPage } from 'next';

import MetaTags from '@components/Common/MetaTags';
import NotLoggedIn from '@components/Shared/NotLoggedIn';
import WrongWallet from '@components/Shared/Settings/WrongWallet';
import { Leafwatch } from '@helpers/leafwatch';
import { APP_NAME } from '@good/data/constants';
import { PAGEVIEW } from '@good/data/tracking';
import { GridItemEight, GridItemFour, GridLayout } from '@good/ui';
import { useEffect } from 'react';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import { useAccount } from 'wagmi';

import SettingsSidebar from '../Sidebar';
import DeleteSettings from './Delete';
import HandleGuardianSettings from './HandleGuardian';
import ProfileGuardianSettings from './ProfileGuardian';

const DangerSettings: NextPage = () => {
  const { currentProfile } = useProfileStore();
  const { address } = useAccount();
  const disabled = currentProfile?.ownedBy.address !== address;

  useEffect(() => {
    Leafwatch.track(PAGEVIEW, { page: 'settings', subpage: 'danger' });
  }, []);

  if (!currentProfile) {
    return <NotLoggedIn />;
  }

  return (
    <GridLayout>
      <MetaTags title={`Delete Profile • ${APP_NAME}`} />
      <GridItemFour>
        <SettingsSidebar />
      </GridItemFour>
      <GridItemEight className="space-y-5">
        {disabled ? (
          <WrongWallet />
        ) : (
          <>
            <ProfileGuardianSettings />
            <HandleGuardianSettings />
            <DeleteSettings />
          </>
        )}
      </GridItemEight>
    </GridLayout>
  );
};

export default DangerSettings;
