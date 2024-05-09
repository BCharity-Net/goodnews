import type { ProfileOnchainIdentity } from '@good/lens';
import type { FC } from 'react';

import { STATIC_IMAGES_URL } from '@good/data/constants';
import { Tooltip } from '@good/ui';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface WorldcoinProps {
  onchainIdentity: ProfileOnchainIdentity;
}

const Worldcoin: FC<WorldcoinProps> = ({ onchainIdentity }) => {
  if (!onchainIdentity?.worldcoin?.isHuman) {
    return null;
  }

  return (
    <Tooltip
      content={
        <span className="flex items-center space-x-1">
          <span>Worldcoin verified</span>
          <CheckCircleIcon className="size-4" />
        </span>
      }
      placement="top"
    >
      <img
        alt="Worldcoin Badge"
        className="drop-shadow-xl"
        height={75}
        src={`${STATIC_IMAGES_URL}/badges/worldcoin.png`}
        width={75}
      />
    </Tooltip>
  );
};

export default Worldcoin;
