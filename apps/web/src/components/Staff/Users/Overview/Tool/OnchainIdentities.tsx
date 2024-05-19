import type { ProfileOnchainIdentity } from '@good/lens';
import type { FC } from 'react';

import MetaDetails from '@components/Shared/MetaDetails';
import {
    GlobeAltIcon,
    HashtagIcon,
    KeyIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { AdjustmentsVerticalIcon } from '@heroicons/react/24/solid';

interface OnchainIdentitiesProps {
  onchainIdentity: ProfileOnchainIdentity;
}

const OnchainIdentities: FC<OnchainIdentitiesProps> = ({ onchainIdentity }) => {
  return (
    <>
      <div className="mt-5 flex items-center space-x-2 text-yellow-600">
        <AdjustmentsVerticalIcon className="size-5" />
        <div className="text-lg font-bold">Onchain Identities</div>
      </div>
      <div className="mt-3 space-y-2 font-bold">
        <MetaDetails
          icon={<KeyIcon className="ld-text-gray-500 size-4" />}
          title="ENS name"
          value={onchainIdentity.ens?.name}
        >
          {onchainIdentity.ens?.name || 'No ENS name'}
        </MetaDetails>
        <MetaDetails
          icon={<UserCircleIcon className="ld-text-gray-500 size-4" />}
          title="Has POH"
        >
          {onchainIdentity.proofOfHumanity ? 'Yes' : 'No'}
        </MetaDetails>
        <MetaDetails
          icon={<HashtagIcon className="ld-text-gray-500 size-4" />}
          title="Sybil verified"
        >
          {onchainIdentity.sybilDotOrg.verified ? 'Yes' : 'No'}
        </MetaDetails>
        <MetaDetails
          icon={<GlobeAltIcon className="ld-text-gray-500 size-4" />}
          title="Worldcoin verified"
        >
          {onchainIdentity.worldcoin.isHuman ? 'Yes' : 'No'}
        </MetaDetails>
      </div>
    </>
  );
};

export default OnchainIdentities;
