import type { FC } from 'react';

import Loader from '@components/Shared/Loader';
import { DEFAULT_COLLECT_TOKEN, STATIC_IMAGES_URL } from '@good/data/constants';
import allowedUnknownOpenActionModules from '@good/helpers/allowedUnknownOpenActionModules';
import { useApprovedModuleAllowanceAmountQuery } from '@good/lens';
import { CardHeader, ErrorMessage, Select } from '@good/ui';
import { useState } from 'react';
import { useAllowedTokensStore } from 'src/store/persisted/useAllowedTokensStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';

import Allowance from './Allowance';

const getAllowancePayload = (currency: string) => {
  return {
    currencies: [currency],
    unknownOpenActionModules: allowedUnknownOpenActionModules
  };
};

const OpenActions: FC = () => {
  const { currentProfile } = useProfileStore();
  const { allowedTokens } = useAllowedTokensStore();
  const [selectedNftOaCurrency, setSelectedNftOaCurrency] = useState(
    DEFAULT_COLLECT_TOKEN
  );
  const [currencyLoading, setCurrencyLoading] = useState(false);

  const { data, error, loading, refetch } =
    useApprovedModuleAllowanceAmountQuery({
      fetchPolicy: 'no-cache',
      skip: !currentProfile?.id,
      variables: { request: getAllowancePayload(DEFAULT_COLLECT_TOKEN) }
    });

  if (error) {
    return (
      <ErrorMessage
        className="mt-5"
        error={error}
        title="Failed to load data"
      />
    );
  }

  return (
    <div>
      <CardHeader
        body="In order to use open actions feature you need to allow the module
        you use, you can allow and revoke the module anytime."
        title="Allow / revoke open actions"
      />
      <div className="m-5">
        <div className="label">Select currency</div>
        <Select
          iconClassName="size-4"
          onChange={(value) => {
            setCurrencyLoading(true);
            setSelectedNftOaCurrency(value);
            refetch({
              request: getAllowancePayload(value)
            }).finally(() => setCurrencyLoading(false));
          }}
          options={
            allowedTokens?.map((token) => ({
              icon: `${STATIC_IMAGES_URL}/tokens/${token.symbol}.svg`,
              label: token.name,
              selected: token.contractAddress === selectedNftOaCurrency,
              value: token.contractAddress
            })) || [{ label: 'Loading...', value: 'Loading...' }]
          }
        />
        {loading || currencyLoading ? (
          <Loader className="py-10" />
        ) : (
          <Allowance allowance={data} />
        )}
      </div>
    </div>
  );
};

export default OpenActions;
