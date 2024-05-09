import type { Preferences } from '@good/types/good';

import { GOOD_API_URL } from '@good/data/constants';
import axios from 'axios';

/**
 * Get profile preferences
 * @param id profile id
 * @param headers auth headers
 * @returns profile preferences
 */
const getPreferences = async (
  id: string,
  headers: any
): Promise<Preferences> => {
  try {
    const response: { data: { result: Preferences } } = await axios.get(
      `${GOOD_API_URL}/preferences/get`,
      { headers, params: { id } }
    );

    return response.data.result;
  } catch {
    return {
      appIcon: 0,
      email: null,
      emailVerified: false,
      features: [],
      hasDismissedOrMintedMembershipNft: true,
      highSignalNotificationFilter: false
    };
  }
};

export default getPreferences;
