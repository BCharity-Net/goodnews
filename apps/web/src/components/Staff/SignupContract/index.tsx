import type { NextPage } from 'next';
import type { Address } from 'viem';

import MetaTags from '@components/Common/MetaTags';
import { APP_NAME } from '@good/data/constants';
import { PAGEVIEW } from '@good/data/tracking';
import {
    Card,
    CardHeader,
    GridItemEight,
    GridItemFour,
    GridLayout
} from '@good/ui';
import { Leafwatch } from '@helpers/leafwatch';
import { useEffect } from 'react';
import Custom404 from 'src/pages/404';
import { useFeatureFlagsStore } from 'src/store/persisted/useFeatureFlagsStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import StaffSidebar from '../Sidebar';
import LensCredits from './LensCredits';
import Mint from './Mint';
import NftsMinted from './NftsMinted';
import ProfilesCreated from './ProfilesCreated';
import RelayerBalance from './RelayerBalance';
import SignupPrice from './SignupPrice';
import SignupsGraph from './SignupsGraph';

const relayAddresses: Address[] = [
  '0x03Ba34f6Ea1496fa316873CF8350A3f7eaD317EF',
  '0x1A15ACfd4293Da7F6dD964f065A0b418355B2b92'
];

const SignupContract: NextPage = () => {
  const { currentProfile } = useProfileStore();
  const { staffMode } = useFeatureFlagsStore();

  useEffect(() => {
    Leafwatch.track(PAGEVIEW, {
      page: 'staff-tools',
      subpage: 'singup-contract'
    });
  }, []);

  if (!currentProfile || !staffMode) {
    return <Custom404 />;
  }

  return (
    <GridLayout>
      <MetaTags title={`Staff Tools • Signup Contract • ${APP_NAME}`} />
      <GridItemFour>
        <StaffSidebar />
      </GridItemFour>
      <GridItemEight className="space-y-5">
        <Card>
          <CardHeader title="Signup Contract" />
          <div className="m-5 space-y-5">
            <LensCredits />
            <SignupPrice />
            <NftsMinted />
            <ProfilesCreated />
          </div>
        </Card>
        <SignupsGraph />
        <Card className="space-y-5 p-5">
          {relayAddresses.map((address, index) => (
            <RelayerBalance address={address} index={index} key={address} />
          ))}
        </Card>
        <Mint />
      </GridItemEight>
    </GridLayout>
  );
};

export default SignupContract;
