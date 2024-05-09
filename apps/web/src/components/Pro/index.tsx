import type { NextPage } from 'next';

import { GoodPro } from '@good/abis';
import { Errors } from '@good/data';
import {
  APP_NAME,
  GOOD_PRO,
  PRO_TIER_PRICES,
  STATIC_IMAGES_URL
} from '@good/data/constants';
import { PAGEVIEW } from '@good/data/tracking';
import formatDate from '@good/helpers/datetime/formatDate';
import { Button } from '@good/ui';
import cn from '@good/ui/cn';
import errorToast from '@helpers/errorToast';
import { Leafwatch } from '@helpers/leafwatch';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useHandleWrongNetwork from 'src/hooks/useHandleWrongNetwork';
import { useProfileRestriction } from 'src/store/non-persisted/useProfileRestriction';
import { useProStore } from 'src/store/non-persisted/useProStore';
import { useProfileStore } from 'src/store/persisted/useProfileStore';
import { parseEther } from 'viem';
import { useTransaction, useWriteContract } from 'wagmi';

const tiers = [
  {
    description: 'Billed monthly',
    featured: true,
    features: [
      'Profile Analytics',
      'Publication Drafts',
      'Choose your app icon',
      'Pro Badge on your profile',
      'Early access to new features',
      'Priority support'
    ],
    id: 'monthly',
    name: 'Monthly',
    price: PRO_TIER_PRICES.monthly
  },
  {
    description: 'Billed annually',
    featured: false,
    features: [
      'All features, plus',
      'Free 2 months of Pro',
      'Support indie team 💖'
    ],
    id: 'annually',
    name: 'Annually',
    price: (PRO_TIER_PRICES.annually / 12).toFixed(1)
  }
];

const Pro: NextPage = () => {
  const { currentProfile } = useProfileStore();
  const { isPro, proExpiresAt } = useProStore();

  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(
    null
  );

  const { isSuspended } = useProfileRestriction();
  const handleWrongNetwork = useHandleWrongNetwork();

  useEffect(() => {
    Leafwatch.track(PAGEVIEW, { page: 'pro' });
  }, []);

  const { isFetching: transactionLoading, isSuccess } = useTransaction({
    hash: transactionHash as `0x${string}`,
    query: { enabled: Boolean(transactionHash) }
  });

  useEffect(() => {
    if (isSuccess) {
      location.reload();
    }
  }, [isSuccess]);

  const { writeContractAsync } = useWriteContract({
    mutation: {
      onError: errorToast,
      onSuccess: (hash: string) => {
        // Leafwatch.track(AUTH.SIGNUP, { price: SIGNUP_PRICE, via: 'crypto' });
        setTransactionHash(hash as `0x${string}`);
      }
    }
  });

  const upgrade = async (id: 'annually' | 'monthly') => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    if (isSuspended) {
      return toast.error(Errors.Suspended);
    }

    try {
      setIsLoading(true);
      await handleWrongNetwork();

      return await writeContractAsync({
        abi: GoodPro,
        address: GOOD_PRO,
        args: [currentProfile.id],
        functionName: id === 'monthly' ? 'subscribeMonthly' : 'subscribeYearly',
        value: parseEther(
          id === 'monthly'
            ? PRO_TIER_PRICES.monthly.toString()
            : PRO_TIER_PRICES.annually.toString()
        )
      });
    } catch (error) {
      errorToast(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-6 py-20">
      <div className="absolute inset-x-0 -z-10 blur-3xl">
        <div
          className="from-brand-300 mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr to-purple-300 opacity-30"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
          }}
        />
      </div>
      <div className="text-center font-bold">
        <h2 className="text-brand-500 text-2xl sm:text-3xl">Upgrade to Pro</h2>
        <p className="mt-4 text-lg sm:text-xl">
          Enjoy an enhanced experience of {APP_NAME}, exclusive creator tools,
          and more.
        </p>
      </div>
      <p className="ld-text-gray-500 mx-auto mt-4 max-w-2xl text-center text-lg leading-7">
        You can extend your Pro subscription anytime for an additional month or
        year, whenever it suits you, without any hassle.
      </p>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center space-y-6 sm:mt-20 sm:space-y-0 lg:max-w-4xl lg:grid-cols-2">
        {tiers.map((tier, tierIdx) => (
          <div
            className={cn(
              tier.featured
                ? 'relative bg-white shadow-2xl dark:bg-black'
                : 'bg-white/60 sm:mx-8 lg:mx-0 dark:bg-black/60',
              tier.featured
                ? ''
                : tierIdx === 0
                  ? 'rounded-t-2xl sm:rounded-b-none lg:rounded-bl-2xl lg:rounded-tr-none'
                  : 'sm:rounded-t-none lg:rounded-bl-none lg:rounded-tr-2xl',
              'rounded-2xl p-8 ring-1 ring-gray-900/10 sm:p-10 dark:ring-gray-100/20'
            )}
            key={tier.id}
          >
            <h3 className="font-bold" id={tier.id}>
              {tier.name}
            </h3>
            <p className="mt-4 flex items-baseline space-x-3">
              <img
                alt="MATIC"
                className="size-7"
                src={`${STATIC_IMAGES_URL}/tokens/matic.svg`}
              />
              <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                {tier.price}
              </span>
              <span className="ld-text-gray-500">/month</span>
            </p>
            <p className="ld-text-gray-500 mt-6">{tier.description}</p>
            <ul className="ld-text-gray-500 mt-8 space-y-1 text-sm sm:mt-10">
              {tier.features.map((feature) => (
                <li className="flex items-center space-x-3" key={feature}>
                  <CheckIcon aria-hidden="true" className="size-5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {proExpiresAt ? (
              <div className="mb-2 mt-6 text-sm">
                Your Pro expires at <b>{formatDate(proExpiresAt)}</b>
              </div>
            ) : null}
            <Button
              className="mt-3 w-full"
              disabled={isLoading || transactionLoading}
              onClick={() => upgrade(tier.id as 'annually' | 'monthly')}
              outline={!tier.featured}
              size="lg"
            >
              {transactionLoading
                ? 'Transaction pending...'
                : isPro
                  ? `Extend a ${tier.id === 'monthly' ? 'Month' : 'Year'}`
                  : 'Upgrade to Pro'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pro;
