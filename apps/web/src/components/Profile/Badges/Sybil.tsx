import type { ProfileOnchainIdentity } from '@good/lens';
import type { FC } from 'react';

import { STATIC_IMAGES_URL } from '@good/data/constants';
import { Tooltip } from '@good/ui';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface SybilProps {
  onchainIdentity: ProfileOnchainIdentity;
}

const Sybil: FC<SybilProps> = ({ onchainIdentity }) => {
  if (!onchainIdentity?.sybilDotOrg?.verified) {
    return null;
  }

  return (
    <Tooltip
      content={
        <span>
          <span className="flex items-center space-x-1">
            <span>Sybil verified</span>
            <CheckCircleIcon className="size-4" />
          </span>
          <span>
            X: <b>@{onchainIdentity?.sybilDotOrg?.source?.twitter?.handle}</b>
          </span>
        </span>
      }
      placement="top"
    >
      <img
        alt="Sybil Badge"
        className="drop-shadow-xl"
        height={75}
        src={`${STATIC_IMAGES_URL}/badges/sybil.png`}
        width={75}
      />
    </Tooltip>
  );
};

export default Sybil;
