import type { Nft, OG } from '@good/types/misc';
import type { FC } from 'react';

import ActionInfo from '@components/Shared/Oembed/Nft/ActionInfo';
import DecentOpenActionShimmer from '@components/Shared/Shimmer/DecentOpenActionShimmer';
import { ZERO_ADDRESS } from '@good/data/constants';
import sanitizeDStorageUrl from '@good/helpers/sanitizeDStorageUrl';
import stopEventPropagation from '@good/helpers/stopEventPropagation';
import { Button, Card, Image, Spinner, Tooltip } from '@good/ui';
import cn from '@good/ui/cn';
import getNftOpenActionKit from '@helpers/getNftOpenActionKit';
import { CursorArrowRaysIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { OPEN_ACTION_EMBED_TOOLTIP, openActionCTA } from '.';

interface DecentOpenActionPreviewProps {
  og: OG;
  openActionEmbedLoading: boolean;
}

const DecentOpenActionPreview: FC<DecentOpenActionPreviewProps> = ({
  og,
  openActionEmbedLoading
}) => {
  const [isNftCoverLoaded, setIsNftCoverLoaded] = useState(false);

  const getUiData = async () => {
    const nftOpenActionKit = getNftOpenActionKit();
    try {
      const uiDataResult = await nftOpenActionKit.generateUiData({
        contentURI: og.url
      });

      return uiDataResult;
    } catch (error) {
      return null;
    }
  };

  const { data: uiData, isLoading } = useQuery({
    enabled: Boolean(og.url),
    queryFn: getUiData,
    queryKey: ['getUiData', og.url]
  });

  const nft: Nft = {
    chain: uiData?.dstChainId.toString() || og.nft?.chain || null,
    collectionName: uiData?.nftName || og.nft?.collectionName || '',
    contractAddress: og.nft?.contractAddress || ZERO_ADDRESS,
    creatorAddress: (uiData?.nftCreatorAddress ||
      og.nft?.creatorAddress ||
      ZERO_ADDRESS) as `0x${string}`,
    description: og.description || '',
    endTime: null,
    mediaUrl:
      sanitizeDStorageUrl(uiData?.nftUri) || og.nft?.mediaUrl || og.image || '',
    mintCount: og.nft?.mintCount || null,
    mintStatus: og.nft?.mintStatus || null,
    mintUrl: og.nft?.mintUrl || null,
    schema: uiData?.tokenStandard || og.nft?.schema || '',
    sourceUrl: og.url
  };

  return (
    <Card className="mt-3" forceRounded onClick={stopEventPropagation}>
      <div className="relative h-[350px] max-h-[350px] w-full overflow-hidden rounded-t-xl">
        <Image
          alt={`Blurred background for ${nft.collectionName}`}
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-lg filter"
          onLoad={() => setIsNftCoverLoaded(true)}
          src={nft.mediaUrl.length ? nft.mediaUrl : undefined}
        />
        <Image
          alt={nft.collectionName}
          className={cn(
            'relative aspect-[1.5] h-full w-full object-contain transition-opacity duration-500',
            isNftCoverLoaded ? 'visible' : 'invisible'
          )}
          onLoad={() => setIsNftCoverLoaded(true)}
          src={nft.mediaUrl.length ? nft.mediaUrl : undefined}
        />
      </div>
      {Boolean(uiData) && Boolean(nft) && !isLoading ? (
        <div className="flex items-center justify-between border-t px-4 py-2 dark:border-gray-700">
          {uiData ? (
            <ActionInfo collectionName={nft.collectionName} uiData={uiData} />
          ) : null}
          {openActionEmbedLoading ? (
            <Spinner size="xs" />
          ) : (
            <Tooltip
              content={<span>{OPEN_ACTION_EMBED_TOOLTIP}</span>}
              placement="top"
            >
              <Button
                className="px-4 py-1"
                icon={<CursorArrowRaysIcon className="size-4" />}
                size="sm"
              >
                {openActionCTA(uiData?.platformName)}
              </Button>
            </Tooltip>
          )}
        </div>
      ) : isLoading ? (
        <DecentOpenActionShimmer />
      ) : null}
    </Card>
  );
};

export default DecentOpenActionPreview;
