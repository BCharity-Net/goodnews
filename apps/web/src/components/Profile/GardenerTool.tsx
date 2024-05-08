import type { Profile } from '@good/lens';
import type { FC } from 'react';

import P2PRecommendation from '@components/Shared/Profile/P2PRecommendation';

interface GardenerToolProps {
  profile: Profile;
}

const GardenerTool: FC<GardenerToolProps> = ({ profile }) => {
  return (
    <div className="space-y-2.5">
      <div className="font-bold">Gardener Tool</div>
      <div>
        <P2PRecommendation profile={profile} />
      </div>
    </div>
  );
};

export default GardenerTool;
