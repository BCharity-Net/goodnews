import type { NextPage } from 'next';

import MetaTags from '@components/Common/MetaTags';
import { Leafwatch } from '@helpers/leafwatch';
import { APP_NAME } from '@good/data/constants';
import { PAGEVIEW } from '@good/data/tracking';
import { GridItemEight, GridItemFour, GridLayout } from '@good/ui';
import { useEffect } from 'react';
import Custom404 from 'src/pages/404';
import { useFeatureFlagsStore } from 'src/store/persisted/useFeatureFlagsStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import StaffSidebar from '../Sidebar';
import List from './List';

const Tokens: NextPage = () => {
  const { currentProfile } = useProfileStore();
  const { staffMode } = useFeatureFlagsStore();

  useEffect(() => {
    Leafwatch.track(PAGEVIEW, { page: 'staff-tools', subpage: 'tokens' });
  }, []);

  if (!currentProfile || !staffMode) {
    return <Custom404 />;
  }

  return (
    <GridLayout>
      <MetaTags title={`Staff Tools • Tokens • ${APP_NAME}`} />
      <GridItemFour>
        <StaffSidebar />
      </GridItemFour>
      <GridItemEight>
        <List />
      </GridItemEight>
    </GridLayout>
  );
};

export default Tokens;
