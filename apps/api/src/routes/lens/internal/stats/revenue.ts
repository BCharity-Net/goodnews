import type { Handler } from 'express';

import { APP_NAME } from '@good/data/constants';
import logger from '@good/helpers/logger';
import lensPg from 'src/db/lensPg';
import catchedError from 'src/helpers/catchedError';

// TODO: add tests
export const get: Handler = async (req, res) => {
  try {
    const result = await lensPg.query(`
      SELECT
        DATE_TRUNC('month', r.block_timestamp) AS month,
        c.name AS currency,
        c.symbol AS symbol,
        SUM(r.amount / POWER(10, c.decimals)) AS revenue
      FROM app.profile_revenue_record r
      JOIN enabled.currency c ON r.currency = c.currency
      WHERE r.app = '${APP_NAME.toLowerCase()}' 
        AND r.fiat_price_snapshot IS NOT NULL
        AND DATE_TRUNC('month', r.block_timestamp) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY DATE_TRUNC('month', r.block_timestamp), c.name, c.symbol
      ORDER BY month, revenue DESC;
    `);

    logger.info('Lens: Fetched app revenue');

    return res.status(200).json({ result, success: true });
  } catch (error) {
    catchedError(res, error);
  }
};
