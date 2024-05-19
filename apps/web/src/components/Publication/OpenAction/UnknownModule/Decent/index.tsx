import type { MirrorablePublication } from '@good/lens';
import type { OG } from '@good/types/misc';
import type { FC } from 'react';

import DecentOpenActionShimmer from '@components/Shared/Shimmer/DecentOpenActionShimmer';
import { GOOD_API_URL, IS_MAINNET } from '@good/data/constants';
import { VerifiedOpenActionModules } from '@good/data/verified-openaction-modules';
import getPublicationData from '@good/helpers/getPublicationData';
import getURLs from '@good/helpers/getURLs';
import stopEventPropagation from '@good/helpers/stopEventPropagation';
import { Card } from '@good/ui';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import FeedEmbed from './FeedEmbed';

export const OPEN_ACTION_EMBED_TOOLTIP = 'Open action embedded';
export const OPEN_ACTION_NO_EMBED_TOOLTIP = 'Mint not availabe anymore';

export const openActionCTA = (platformName?: string): string => {
  const name = platformName || '';
  const platform = name.toLowerCase();
  return ['opensea', 'rarible', 'superrare'].includes(platform)
    ? 'Buy'
    : 'Mint';
};
interface DecentOpenActionProps {
  publication: MirrorablePublication;
}

const DecentOpenAction: FC<DecentOpenActionProps> = ({ publication }) => {
  const { metadata } = publication;
  const filteredContent = getPublicationData(metadata)?.content || '';

  const urls = getURLs(filteredContent);
  const url = urls[0] as string;

  const { data, error, isLoading } = useQuery({
    enabled: Boolean(url),
    queryFn: async () => {
      const response = await axios.get(`${GOOD_API_URL}/oembed`, {
        params: { url }
      });
      return response.data.oembed;
    },
    queryKey: ['getOembed', url],
    refetchOnMount: false
  });

  const og = {
    description: data?.description,
    image: data?.image,
    nft: data?.nft,
    title: data?.title,
    url: url
  } as OG;

  const canPerformDecentAction = Boolean(
    publication.openActionModules.some(
      (module) =>
        module.contract.address === VerifiedOpenActionModules.DecentNFT
    )
  );

  const embedDecentOpenAction = IS_MAINNET && canPerformDecentAction;

  if (isLoading) {
    return (
      <Card forceRounded onClick={stopEventPropagation}>
        <div className="shimmer h-[350px] max-h-[350px] rounded-t-xl" />
        <DecentOpenActionShimmer />
      </Card>
    );
  }

  if (error || !data || !embedDecentOpenAction || !og.nft) {
    return null;
  }

  return <FeedEmbed og={og} publication={publication} />;
};

export default DecentOpenAction;
