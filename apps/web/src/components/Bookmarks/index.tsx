import type { PublicationMetadataMainFocusType } from '@good/lens';
import type { NextPage } from 'next';

import MetaTags from '@components/Common/MetaTags';
import WhoToFollow from '@components/Home/Sidebar/WhoToFollow';
import FeedFocusType from '@components/Shared/FeedFocusType';
import Footer from '@components/Shared/Footer';
import NotLoggedIn from '@components/Shared/NotLoggedIn';
import { APP_NAME } from '@good/data/constants';
import { PAGEVIEW } from '@good/data/tracking';
import { GridItemEight, GridItemFour, GridLayout } from '@good/ui';
import { Leafwatch } from '@helpers/leafwatch';
import { useEffect, useState } from 'react';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import Feed from './Feed';

const Bookmarks: NextPage = () => {
  const { currentProfile } = useProfileStore();
  const [focus, setFocus] = useState<PublicationMetadataMainFocusType>();

  useEffect(() => {
    Leafwatch.track(PAGEVIEW, { page: 'bookmarks' });
  }, []);

  if (!currentProfile) {
    return <NotLoggedIn />;
  }

  return (
    <GridLayout>
      <MetaTags title={`Bookmarks • ${APP_NAME}`} />
      <GridItemEight className="space-y-5">
        <FeedFocusType focus={focus} setFocus={setFocus} />
        <Feed focus={focus} />
      </GridItemEight>
      <GridItemFour>
        <WhoToFollow />
        <Footer />
      </GridItemFour>
    </GridLayout>
  );
};

export default Bookmarks;
