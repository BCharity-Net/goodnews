import axios from 'axios';
import { TEST_URL } from 'src/helpers/constants';
import { describe, expect, test } from 'vitest';

describe('badges/hasGoodNft', () => {
  // TODO: don't skip this test
  test.skip('should return true if address has Good NFT', async () => {
    const response = await axios.get(`${TEST_URL}/badges/hasGoodNft`, {
      params: { address: '0x03Ba34f6Ea1496fa316873CF8350A3f7eaD317EF' }
    });

    expect(response.data.hasGoodNft).toBeTruthy();
  });

  // TODO: don't skip this test
  test.skip('should return false if address does not have Good NFT', async () => {
    const response = await axios.get(`${TEST_URL}/badges/hasGoodNft`, {
      params: { address: '0x9AF37db37E74A0Fd6c12cDc84cC4C870d0bd41b9' }
    });

    expect(response.data.hasGoodNft).toBeFalsy();
  });
});
