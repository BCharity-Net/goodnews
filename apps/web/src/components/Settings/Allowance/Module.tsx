import type { FC } from 'react';

import getAllowanceModule from '@helpers/getAllowanceModule';
import getAllowanceOpenAction from '@helpers/getAllowanceOpenAction';
import { POLYGONSCAN_URL } from '@good/data/constants';
import {
  type ApprovedAllowanceAmountResult,
  OpenActionModuleType
} from '@good/lens';
import { Card } from '@good/ui';
import Link from 'next/link';
import { useState } from 'react';

import AllowanceButton from './Button';

interface ModuleProps {
  module: ApprovedAllowanceAmountResult;
}

const Module: FC<ModuleProps> = ({ module }) => {
  const [allowed, setAllowed] = useState(
    parseFloat(module?.allowance.value) > 0
  );

  return (
    <Card
      className="block items-center justify-between p-5 sm:flex"
      forceRounded
      key={module?.moduleName}
    >
      <div className="mb-3 mr-1.5 overflow-hidden sm:mb-0">
        <div className="whitespace-nowrap font-bold">
          {module.moduleName === OpenActionModuleType.UnknownOpenActionModule
            ? getAllowanceOpenAction(module?.moduleContract.address).name
            : getAllowanceModule(module?.moduleName).name}
        </div>
        <Link
          className="ld-text-gray-500 truncate text-sm"
          href={`${POLYGONSCAN_URL}/address/${module?.moduleContract.address}`}
          rel="noreferrer noopener"
          target="_blank"
        >
          {module?.moduleContract.address}
        </Link>
      </div>
      <AllowanceButton
        allowed={allowed}
        module={module}
        setAllowed={setAllowed}
      />
    </Card>
  );
};

export default Module;
