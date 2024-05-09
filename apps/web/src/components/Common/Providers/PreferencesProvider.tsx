import type { FiatRate } from '@good/types/lens';
import type { FC } from 'react';

import { GOOD_API_URL } from '@good/data/constants';
import { FeatureFlag } from '@good/data/feature-flags';
import getAllTokens from '@good/helpers/api/getAllTokens';
import getPreferences from '@good/helpers/api/getPreferences';
import getScore from '@good/helpers/api/getScore';
import getAuthApiHeaders from '@helpers/getAuthApiHeaders';
import getCurrentSession from '@helpers/getCurrentSession';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { usePreferencesStore } from 'src/store/non-persisted/usePreferencesStore';
import { useProfileRestriction } from 'src/store/non-persisted/useProfileRestriction';
import { useScoreStore } from 'src/store/non-persisted/useScoreStore';
import { useAllowedTokensStore } from 'src/store/persisted/useAllowedTokensStore';
import { useFeatureFlagsStore } from 'src/store/persisted/useFeatureFlagsStore';
import { useRatesStore } from 'src/store/persisted/useRatesStore';
import { useVerifiedMembersStore } from 'src/store/persisted/useVerifiedMembersStore';

const PreferencesProvider: FC = () => {
  const { id: sessionProfileId } = getCurrentSession();
  const { setVerifiedMembers } = useVerifiedMembersStore();
  const { setAllowedTokens } = useAllowedTokensStore();
  const { setFiatRates } = useRatesStore();
  const { setScore } = useScoreStore();
  const {
    setAppIcon,
    setEmail,
    setEmailVerified,
    setHasDismissedOrMintedMembershipNft,
    setHighSignalNotificationFilter
  } = usePreferencesStore();
  const { setRestriction } = useProfileRestriction();
  const { setFeatureFlags, setGardenerMode, setStaffMode } =
    useFeatureFlagsStore();

  // Fetch preferences and set initial values
  useQuery({
    enabled: Boolean(sessionProfileId),
    queryFn: () =>
      getPreferences(sessionProfileId, getAuthApiHeaders()).then(
        (preferences) => {
          // Profile preferences
          setHighSignalNotificationFilter(
            preferences.highSignalNotificationFilter
          );
          setAppIcon(preferences.appIcon);

          // Email preferences
          setEmail(preferences.email);
          setEmailVerified(preferences.emailVerified);

          // Feature flags
          setFeatureFlags(preferences.features);
          setStaffMode(preferences.features.includes(FeatureFlag.StaffMode));
          setGardenerMode(
            preferences?.features.includes(FeatureFlag.GardenerMode)
          );
          setRestriction({
            isFlagged: preferences.features.includes(FeatureFlag.Flagged),
            isSuspended: preferences.features.includes(FeatureFlag.Suspended)
          });

          // Membership NFT
          setHasDismissedOrMintedMembershipNft(
            preferences.hasDismissedOrMintedMembershipNft
          );

          return true;
        }
      ),
    queryKey: ['getPreferences', sessionProfileId || '']
  });

  // Fetch verified members
  const getVerifiedMembers = async () => {
    try {
      const response = await axios.get(`${GOOD_API_URL}/misc/verified`);
      const { data } = response;
      setVerifiedMembers(data.result || []);
      return true;
    } catch {
      return false;
    }
  };

  // Fetch score
  useQuery({
    enabled: Boolean(sessionProfileId),
    queryFn: () =>
      getScore(sessionProfileId).then((score) => {
        setScore(score.score);
        return score;
      }),
    queryKey: ['getScore', sessionProfileId]
  });

  useQuery({
    queryFn: getVerifiedMembers,
    queryKey: ['getVerifiedMembers']
  });

  // Fetch allowed tokens
  useQuery({
    queryFn: () =>
      getAllTokens().then((tokens) => {
        setAllowedTokens(tokens);
        return tokens;
      }),
    queryKey: ['getAllTokensPreference']
  });

  const getFiatRates = async (): Promise<FiatRate[]> => {
    try {
      const response = await axios.get(`${GOOD_API_URL}/lens/rate`);
      const { data } = response;
      return data.result || [];
    } catch {
      return [];
    }
  };

  // Fetch fiat rates
  useQuery({
    queryFn: () =>
      getFiatRates().then((rates) => {
        setFiatRates(rates);
        return rates;
      }),
    queryKey: ['getFiatRates']
  });

  return null;
};

export default PreferencesProvider;
