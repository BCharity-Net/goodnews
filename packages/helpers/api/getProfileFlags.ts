import type { ProfileFlags } from '@good/types/good';

import { GOOD_API_URL } from '@good/data/constants';
import axios from 'axios';

/**
 * Get profile flags
 * @param id profile id
 * @returns profile flags
 */
const getProfileFlags = async (id: string): Promise<null | ProfileFlags> => {
  try {
    const response = await axios.get(`${GOOD_API_URL}/profile/flags`, {
      params: { id }
    });

    return response.data.result;
  } catch {
    return null;
  }
};

export default getProfileFlags;
