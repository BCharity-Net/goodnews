import type { Preferences } from '@good/types/good';

import { TEST_LENS_ID } from '@good/data/constants';
import getAuthApiHeadersForTest from '@good/helpers/getAuthApiHeadersForTest';
import axios from 'axios';
import { TEST_URL } from 'src/helpers/constants';
import { describe, expect, test } from 'vitest';

describe('preferences/get', () => {
  test('should return profile preferences', async () => {
    const response: {
      data: { result: Preferences };
    } = await axios.get(`${TEST_URL}/preferences/get`, {
      headers: await getAuthApiHeadersForTest(),
      params: { id: TEST_LENS_ID }
    });

    expect(response.data.result.features).toBeInstanceOf(Array);
    expect(response.data.result.hasDismissedOrMintedMembershipNft).toBeTypeOf(
      'boolean'
    );
    expect(response.data.result.highSignalNotificationFilter).toBeTruthy();
    expect(response.data.result.appIcon).toEqual(1);
  });

  test('should fail if not authenticated', async () => {
    try {
      const response = await axios.get(`${TEST_URL}/preferences/get`);
      expect(response.status).toEqual(401);
    } catch {}
  });
});
