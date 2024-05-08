import type { MirrorablePublication } from '@good/lens';

import getPublicationOGImages from '@helpers/getPublicationOGImages';
import { APP_NAME } from '@good/data/constants';
import allowedOpenActionModules from '@good/helpers/allowedOpenActionModules';
import getProfile from '@good/helpers/getProfile';

const getCollectModuleMetadata = (publication: MirrorablePublication) => {
  const { openActionModules } = publication;

  if (!openActionModules) {
    return;
  }

  const openAction = openActionModules.filter((module) =>
    allowedOpenActionModules.includes(module.type)
  );

  // 0 th index is the collect module
  const collectModule = openAction.length ? openAction[0] : null;

  if (!collectModule) {
    return;
  }

  const { slugWithPrefix } = getProfile(publication.by);

  return {
    'eth:nft:chain': 'polygon',
    'eth:nft:collection': `${publication.__typename} by ${slugWithPrefix} • ${APP_NAME}`,
    'eth:nft:contract_address': collectModule.contract.address,
    'eth:nft:creator_address': publication.by.ownedBy.address,
    'eth:nft:media_url': getPublicationOGImages(publication.metadata)[0],
    'eth:nft:mint_count': publication.stats.countOpenActions,
    'eth:nft:mint_url': `https://bcharity.net/posts/${publication.id}`,
    'eth:nft:schema': 'ERC721'
  };
};

export default getCollectModuleMetadata;
