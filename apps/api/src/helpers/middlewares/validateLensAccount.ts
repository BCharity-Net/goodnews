import type { Request } from 'express';

import LensEndpoint from '@good/data/lens-endpoints';
import axios from 'axios';

/**
 * Middleware to validate Lens access token
 * @param request Incoming request
 * @returns Response
 */
const validateLensAccount = async (request: Request) => {
  const accessToken = request.headers['x-access-token'] as string;
  const network = request.headers['x-lens-network'] as string;
  const allowedNetworks = ['mainnet', 'testnet'];

  if (!accessToken || !network || !allowedNetworks.includes(network)) {
    return false;
  }

  const isMainnet = network === 'mainnet';
  try {
    const { data } = await axios.post(
      isMainnet ? LensEndpoint.Mainnet : LensEndpoint.Testnet,
      {
        query: `
          query Verify {
            verify(request: { accessToken: "${accessToken}" })
          }
        `
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-agent': 'Bcharity.net'
        }
      }
    );

    if (data.data.verify) {
      return true;
    }
  } catch {
    return false;
  }
};

export default validateLensAccount;
