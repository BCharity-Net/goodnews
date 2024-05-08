import type { NextPage } from 'next';

import MetaTags from '@components/Common/MetaTags';
import NotLoggedIn from '@components/Shared/NotLoggedIn';
import { Leafwatch } from '@helpers/leafwatch';
import { APP_NAME } from '@good/data/constants';
import { PAGEVIEW } from '@good/data/tracking';
import { GridItemEight, GridItemFour, GridLayout } from '@good/ui';
import { useEffect } from 'react';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import SettingsSidebar from '../Sidebar';
import AppIcon from './AppIcon';

const ProSettings: NextPage = () => {
  const { currentProfile } = useProfileStore();

  useEffect(() => {
    Leafwatch.track(PAGEVIEW, { page: 'settings', subpage: 'preferences' });
  }, []);

  if (!currentProfile) {
    return <NotLoggedIn />;
  }

  return (
    <GridLayout>
      <MetaTags title={`Pro settings • ${APP_NAME}`} />
      <GridItemFour>
        <SettingsSidebar />
      </GridItemFour>
      <GridItemEight>
        <AppIcon />
      </GridItemEight>
    </GridLayout>
  );
};

export default ProSettings;
