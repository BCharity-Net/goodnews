import type { Profile } from '@good/lens';
import type { NextPage } from 'next';

import MetaTags from '@components/Common/MetaTags';
import Loader from '@components/Shared/Loader';
import StaffSidebar from '@components/Staff/Sidebar';
import ProfileStaffTool from '@components/Staff/Users/Overview/Tool';
import { APP_NAME } from '@good/data/constants';
import { PAGEVIEW } from '@good/data/tracking';
import { useProfileQuery } from '@good/lens';
import {
  Card,
  EmptyState,
  ErrorMessage,
  GridItemEight,
  GridItemFour,
  GridLayout
} from '@good/ui';
import { Leafwatch } from '@helpers/leafwatch';
import { UserIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Custom404 from 'src/pages/404';
import { useFeatureFlagsStore } from 'src/store/persisted/useFeatureFlagsStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

const Overview: NextPage = () => {
  const {
    isReady,
    query: { id }
  } = useRouter();
  const { currentProfile } = useProfileStore();
  const { staffMode } = useFeatureFlagsStore();

  useEffect(() => {
    Leafwatch.track(PAGEVIEW, {
      page: 'staff-tools',
      subpage: 'user-overview'
    });
  }, []);

  const { data, error, loading } = useProfileQuery({
    skip: !id || !isReady,
    variables: { request: { forProfileId: id } }
  });
  const profile = data?.profile as Profile;

  if (!currentProfile || !staffMode) {
    return <Custom404 />;
  }

  return (
    <GridLayout>
      <MetaTags title={`Staff Tools • User Overview • ${APP_NAME}`} />
      <GridItemFour>
        <StaffSidebar />
      </GridItemFour>
      <GridItemEight>
        <Card className="border-dashed border-yellow-600 !bg-yellow-300/20 p-5">
          {loading ? (
            <Loader className="my-5" message="Loading profile" />
          ) : !profile ? (
            <EmptyState
              hideCard
              icon={<UserIcon className="size-8" />}
              message="No profile found"
            />
          ) : error ? (
            <ErrorMessage error={error} />
          ) : (
            <ProfileStaffTool profile={profile} />
          )}
        </Card>
      </GridItemEight>
    </GridLayout>
  );
};

export default Overview;
