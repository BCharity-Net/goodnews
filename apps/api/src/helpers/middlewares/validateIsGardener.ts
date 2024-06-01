import type { Request } from 'express';

import parseJwt from '@good/helpers/parseJwt';
import heyPg from 'src/db/goodPg';

import { GARDENER_FEATURE_ID } from '../constants';
import validateLensAccount from './validateLensAccount';

/**
 * Middleware to validate if the profile is gardener
 * @param request Incoming request
 * @returns Response
 */
const validateIsGardener = async (request: Request) => {
  const validateLensAccountStatus = await validateLensAccount(request);
  if (validateLensAccountStatus !== 200) {
    return validateLensAccountStatus;
  }

  try {
    const accessToken = request.headers['x-access-token'] as string;

    if (!accessToken) {
      return 400;
    }

    const payload = parseJwt(accessToken);
    const data = await heyPg.query(
      `
        SELECT enabled
        FROM "ProfileFeature"
        WHERE enabled = TRUE
        AND "featureId" = $1
        AND "profileId" = $2
        LIMIT 1;
      `,
      [GARDENER_FEATURE_ID, payload.id]
    );

    if (data[0]?.enabled) {
      return 200;
    }

    return 401;
  } catch {
    return 500;
  }
};

export default validateIsGardener;
