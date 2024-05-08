import type { FC } from 'react';

import { HeyMembershipNft } from '@good/abis';
import { HEY_MEMBERSHIP_NFT } from '@good/data/constants';
import { NumberedStat } from '@good/ui';
import { useReadContract } from 'wagmi';

const NftsMinted: FC = () => {
  const { data: totalSupply } = useReadContract({
    abi: HeyMembershipNft,
    address: HEY_MEMBERSHIP_NFT,
    functionName: 'totalSupply',
    query: { refetchInterval: 2000 }
  });

  return (
    <NumberedStat
      count={totalSupply?.toString() || '0'}
      name={`Total Membership NFTs`}
      suffix="NFTs"
    />
  );
};

export default NftsMinted;
