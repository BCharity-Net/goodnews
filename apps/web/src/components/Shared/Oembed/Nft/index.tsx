import type { Nft as INft } from '@good/types/misc';
import type { FC } from 'react';

import { PUBLICATION } from '@good/data/tracking';
import getNftChainInfo from '@good/helpers/getNftChainInfo';
import stopEventPropagation from '@good/helpers/stopEventPropagation';
import { Button, Card, Tooltip } from '@good/ui';
import { Leafwatch } from '@helpers/leafwatch';
import { CursorArrowRaysIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import MintedBy from './MintedBy';

interface NftProps {
  nft: INft;
  publicationId?: string;
}

const Nft: FC<NftProps> = ({ nft, publicationId }) => {
  return (
    <Card className="mt-3" forceRounded onClick={stopEventPropagation}>
      <div className="relative">
        <img
          alt={nft.collectionName}
          className="h-[350px] max-h-[350px] w-full rounded-t-xl object-cover"
          src={nft.mediaUrl}
        />
        {nft.creatorAddress ? <MintedBy address={nft.creatorAddress} /> : null}
      </div>
      <div className="flex items-center justify-between border-t px-3 py-2 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {nft.chain ? (
            <Tooltip
              content={getNftChainInfo(nft.chain).name}
              placement="right"
            >
              <img
                alt={getNftChainInfo(nft.chain).name}
                className="size-5"
                src={getNftChainInfo(nft.chain).logo}
              />
            </Tooltip>
          ) : null}
          <div className="line-clamp-1 text-sm font-bold">
            {nft.collectionName}
          </div>
        </div>
        <Link href={nft.sourceUrl} rel="noopener noreferrer" target="_blank">
          <Button
            className="ml-5 text-sm"
            icon={<CursorArrowRaysIcon className="size-4" />}
            onClick={() =>
              Leafwatch.track(PUBLICATION.OPEN_NFT, {
                publication_id: publicationId
              })
            }
            size="md"
          >
            Mint
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default Nft;
