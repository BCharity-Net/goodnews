import type { ProfileOnchainIdentity } from '@good/lens';
import type { FC } from 'react';

import { HEY_API_URL } from '@good/data/constants';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import Ens from './Ens';
import GoodProfile from './GoodProfile';
import HeyNft from './HeyNft';
import ProofOfHumanity from './ProofOfHumanity';
import Sybil from './Sybil';
import Worldcoin from './Worldcoin';

interface BadgesProps {
  address: string;
  id: string;
  onchainIdentity: ProfileOnchainIdentity;
}

const Badges: FC<BadgesProps> = ({ address, id, onchainIdentity }) => {
  // Begin: Get isGoodProfile
  const getIsGoodProfile = async (): Promise<boolean> => {
    const response = await axios.get(`${HEY_API_URL}/badges/isGoodProfile`, {
      params: { id }
    });
    const { data } = response;

    return data?.isGoodProfile || false;
  };

  const { data: isGoodProfile } = useQuery({
    queryFn: getIsGoodProfile,
    queryKey: ['getIsGoodProfile', id]
  });
  // End: Get isGoodProfile

  // Begin: Check has Good NFT
  const getHasHeyNft = async (): Promise<boolean> => {
    const response = await axios.get(`${HEY_API_URL}/badges/hasHeyNft`, {
      params: { address }
    });
    const { data } = response;

    return data?.hasHeyNft || false;
  };

  const { data: hasHeyNft } = useQuery({
    queryFn: getHasHeyNft,
    queryKey: ['getHasHeyNft', address]
  });
  // End: Check has Good NFT

  const hasOnChainIdentity =
    onchainIdentity?.proofOfHumanity ||
    onchainIdentity?.sybilDotOrg?.verified ||
    onchainIdentity?.ens?.name ||
    onchainIdentity?.worldcoin?.isHuman ||
    isGoodProfile ||
    hasHeyNft;

  if (!hasOnChainIdentity) {
    return null;
  }

  return (
    <>
      <div className="divider w-full" />
      <div className="flex flex-wrap gap-3">
        <ProofOfHumanity onchainIdentity={onchainIdentity} />
        <Ens onchainIdentity={onchainIdentity} />
        <Sybil onchainIdentity={onchainIdentity} />
        <Worldcoin onchainIdentity={onchainIdentity} />
        {isGoodProfile && <GoodProfile />}
        {hasHeyNft && <HeyNft />}
      </div>
    </>
  );
};

export default Badges;
