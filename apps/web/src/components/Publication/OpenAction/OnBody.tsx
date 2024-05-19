import type {
    MirrorablePublication,
    UnknownOpenActionModuleSettings
} from '@good/lens';
import type { FC } from 'react';

import { VerifiedOpenActionModules } from '@good/data/verified-openaction-modules';
import isFeatureAvailable from '@helpers/isFeatureAvailable';

import DecentOpenAction from './UnknownModule/Decent';
import RentableBillboardOpenAction from './UnknownModule/RentableBillboard';
import SwapOpenAction from './UnknownModule/Swap';

interface OpenActionOnBodyProps {
  publication: MirrorablePublication;
}

const OpenActionOnBody: FC<OpenActionOnBodyProps> = ({ publication }) => {
  const module = publication.openActionModules.find(
    (module) =>
      module.contract.address === VerifiedOpenActionModules.Swap ||
      module.contract.address === VerifiedOpenActionModules.RentableBillboard ||
      module.contract.address === VerifiedOpenActionModules.DecentNFT
  );

  if (!module) {
    return null;
  }

  return (
    <div className="mt-3">
      {module.contract.address === VerifiedOpenActionModules.Swap && (
        <SwapOpenAction
          module={module as UnknownOpenActionModuleSettings}
          publication={publication}
        />
      )}
      {isFeatureAvailable('rent-ads') &&
        module.contract.address ===
          VerifiedOpenActionModules.RentableBillboard && (
          <RentableBillboardOpenAction
            module={module as UnknownOpenActionModuleSettings}
            publication={publication}
          />
        )}
      {module.contract.address === VerifiedOpenActionModules.DecentNFT && (
        <DecentOpenAction publication={publication} />
      )}
    </div>
  );
};

export default OpenActionOnBody;
