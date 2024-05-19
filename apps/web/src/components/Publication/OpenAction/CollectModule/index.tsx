import type {
    AnyPublication,
    LegacyMultirecipientFeeCollectModuleSettings,
    LegacySimpleCollectModuleSettings,
    MultirecipientFeeCollectOpenActionSettings,
    OpenActionModule,
    SimpleCollectOpenActionSettings
} from '@good/lens';
import type { FC } from 'react';

import CountdownTimer from '@components/Shared/CountdownTimer';
import Slug from '@components/Shared/Slug';
import { POLYGONSCAN_URL } from '@good/data/constants';
import formatDate from '@good/helpers/datetime/formatDate';
import formatAddress from '@good/helpers/formatAddress';
import getProfile from '@good/helpers/getProfile';
import getTokenImage from '@good/helpers/getTokenImage';
import humanize from '@good/helpers/humanize';
import nFormatter from '@good/helpers/nFormatter';
import { isMirrorPublication } from '@good/helpers/publicationHelpers';
import { HelpTooltip, Tooltip, WarningMessage } from '@good/ui';
import {
    BanknotesIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    PhotoIcon,
    PuzzlePieceIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import { useCounter } from '@uidotdev/usehooks';
import Link from 'next/link';
import plur from 'plur';
import { useAllowedTokensStore } from 'src/store/persisted/useAllowedTokensStore';

import CollectAction from './CollectAction';
import Splits from './Splits';

interface CollectModuleProps {
  openAction: OpenActionModule;
  publication: AnyPublication;
}

const CollectModule: FC<CollectModuleProps> = ({ openAction, publication }) => {
  const { allowedTokens } = useAllowedTokensStore();
  const targetPublication = isMirrorPublication(publication)
    ? publication?.mirrorOn
    : publication;

  const [countOpenActions, { increment }] = useCounter(
    targetPublication.stats.countOpenActions
  );

  const collectModule = openAction as
    | LegacyMultirecipientFeeCollectModuleSettings
    | LegacySimpleCollectModuleSettings
    | MultirecipientFeeCollectOpenActionSettings
    | SimpleCollectOpenActionSettings;

  const endTimestamp = collectModule?.endsAt;
  const collectLimit = parseInt(collectModule?.collectLimit || '0');
  const amount = parseFloat(collectModule?.amount?.value || '0');
  const usdPrice = collectModule?.amount?.asFiat?.value;
  const currency = collectModule?.amount?.asset?.symbol;
  const referralFee = collectModule?.referralFee;
  const isMultirecipientFeeCollectModule =
    collectModule.__typename === 'MultirecipientFeeCollectOpenActionSettings';
  const percentageCollected = (countOpenActions / collectLimit) * 100;
  const enabledTokens = allowedTokens?.map((t) => t.symbol);
  const isTokenEnabled = enabledTokens?.includes(currency);
  const isSaleEnded = endTimestamp
    ? new Date(endTimestamp).getTime() / 1000 < new Date().getTime() / 1000
    : false;
  const isAllCollected = collectLimit
    ? countOpenActions >= collectLimit
    : false;

  return (
    <>
      {collectLimit ? (
        <Tooltip
          content={`${percentageCollected.toFixed(0)}% Collected`}
          placement="top"
        >
          <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2.5 bg-black dark:bg-white"
              style={{ width: `${percentageCollected}%` }}
            />
          </div>
        </Tooltip>
      ) : null}
      <div className="p-5">
        {isAllCollected ? (
          <WarningMessage
            className="mb-5"
            message={
              <div className="flex items-center space-x-1.5">
                <CheckCircleIcon className="size-4" />
                <span>This collection has been sold out</span>
              </div>
            }
          />
        ) : isSaleEnded ? (
          <WarningMessage
            className="mb-5"
            message={
              <div className="flex items-center space-x-1.5">
                <ClockIcon className="size-4" />
                <span>This collection has ended</span>
              </div>
            }
          />
        ) : null}
        <div className="mb-4">
          <div className="text-xl font-bold">
            {targetPublication.__typename} by{' '}
            <Slug slug={getProfile(targetPublication.by).slugWithPrefix} />
          </div>
        </div>
        {amount ? (
          <div className="flex items-center space-x-1.5 py-2">
            {isTokenEnabled ? (
              <img
                alt={currency}
                className="size-7"
                height={28}
                src={getTokenImage(currency)}
                title={currency}
                width={28}
              />
            ) : (
              <CurrencyDollarIcon className="size-7" />
            )}
            <span className="space-x-1">
              <span className="text-2xl font-bold">{amount}</span>
              <span className="text-xs">{currency}</span>
              {isTokenEnabled && usdPrice ? (
                <>
                  <span className="ld-text-gray-500 px-0.5">·</span>
                  <span className="ld-text-gray-500 text-xs font-bold">
                    ${usdPrice}
                  </span>
                </>
              ) : null}
            </span>
            <div className="mt-2">
              <HelpTooltip>
                <div className="py-1">
                  <b>Collect Fees</b>
                  <div className="flex items-start space-x-10">
                    <div>Lens Protocol</div>
                    <b>
                      {(amount * 0.05).toFixed(2)} {currency} (5%)
                    </b>
                  </div>
                </div>
              </HelpTooltip>
            </div>
          </div>
        ) : null}
        <div className="space-y-1.5">
          <div className="block items-center space-y-1 sm:flex sm:space-x-5">
            <div className="flex items-center space-x-2">
              <UsersIcon className="ld-text-gray-500 size-4" />
              <Link
                className="font-bold"
                href={`/posts/${targetPublication.id}/collectors`}
              >
                {humanize(countOpenActions)}{' '}
                {plur('collector', countOpenActions)}
              </Link>
            </div>
            {collectLimit && !isAllCollected ? (
              <div className="flex items-center space-x-2">
                <PhotoIcon className="ld-text-gray-500 size-4" />
                <div className="font-bold">
                  {collectLimit - countOpenActions} available
                </div>
              </div>
            ) : null}
            {referralFee ? (
              <div className="flex items-center space-x-2">
                <BanknotesIcon className="ld-text-gray-500 size-4" />
                <div className="font-bold">{referralFee}% referral fee</div>
              </div>
            ) : null}
          </div>
          {endTimestamp && !isAllCollected ? (
            <div className="flex items-center space-x-2">
              <ClockIcon className="ld-text-gray-500 size-4" />
              <div className="space-x-1.5">
                <span>{isSaleEnded ? 'Sale ended on:' : 'Sale ends:'}</span>
                <span className="font-bold text-gray-600">
                  {isSaleEnded ? (
                    `${formatDate(endTimestamp, 'MMM D, YYYY, hh:mm A')}`
                  ) : (
                    <CountdownTimer targetDate={endTimestamp} />
                  )}
                </span>
              </div>
            </div>
          ) : null}
          {collectModule.collectNft ? (
            <div className="flex items-center space-x-2">
              <PuzzlePieceIcon className="ld-text-gray-500 size-4" />
              <div className="space-x-1.5">
                <span>Token:</span>
                <Link
                  className="font-bold text-gray-600"
                  href={`${POLYGONSCAN_URL}/token/${collectModule.collectNft}`}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {formatAddress(collectModule.collectNft)}
                </Link>
              </div>
            </div>
          ) : null}
          {amount ? (
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="ld-text-gray-500 size-4" />
              <div className="space-x-1.5">
                <span>Revenue:</span>
                <Tooltip
                  content={`${humanize(amount * countOpenActions)} ${currency}`}
                  placement="top"
                >
                  <span className="font-bold text-gray-600">
                    {nFormatter(amount * countOpenActions)} {currency}
                  </span>
                </Tooltip>
              </div>
            </div>
          ) : null}
          {isMultirecipientFeeCollectModule ? (
            <Splits recipients={collectModule?.recipients} />
          ) : null}
        </div>
        <div className="flex items-center space-x-2">
          <CollectAction
            countOpenActions={countOpenActions}
            onCollectSuccess={() => increment()}
            openAction={openAction}
            publication={targetPublication}
          />
        </div>
      </div>
    </>
  );
};

export default CollectModule;
