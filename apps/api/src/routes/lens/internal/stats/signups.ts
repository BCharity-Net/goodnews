import type { Handler } from 'express';

import { GOOD_LENS_SIGNUP } from '@good/data/constants';
import logger from '@good/helpers/logger';
import lensPg from 'src/db/lensPg';
import catchedError from 'src/helpers/catchedError';

// TODO: add tests
export const get: Handler = async (req, res) => {
  try {
    const result = await lensPg.query(
      `
        SELECT
          block_timestamp::date AS date,
          COUNT(*) AS count
        FROM app.onboarding_profile
        WHERE
          onboarded_by_address = $1
          AND block_timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY date
        ORDER BY date;
      `,
      [GOOD_LENS_SIGNUP]
    );

    const formattedResult = result.map((row) => ({
      count: Number(row.count),
      date: new Date(row.date).toISOString()
    }));

    logger.info('Lens: Fetched signup stats');

    return res.status(200).json({ result: formattedResult, success: true });
  } catch (error) {
    catchedError(res, error);
  }
};
