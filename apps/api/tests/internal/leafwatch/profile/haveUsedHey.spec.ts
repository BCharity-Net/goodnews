import axios from 'axios';
import { TEST_URL } from 'src/helpers/constants';
import { describe, expect, test } from 'vitest';

describe('internal/leafwatch/profile/haveUsedHey', () => {
  test('should return have used good status', async () => {
    const response = await axios.get(
      `${TEST_URL}/internal/leafwatch/profile/haveUsedHey`,
      { params: { id: '0x0d' } }
    );

    expect(response.data.haveUsedHey).toBeTruthy();
  });

  test('should return have not used good status', async () => {
    const response = await axios.get(
      `${TEST_URL}/internal/leafwatch/profile/haveUsedHey`,
      { params: { id: '0x00' } }
    );

    expect(response.data.haveUsedHey).toBeFalsy();
  });
});
