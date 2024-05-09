import type { Handler } from 'express';

import goodPg from 'src/db/goodPg';
import catchedError from 'src/helpers/catchedError';

// TODO: add tests
export const get: Handler = async (req, res) => {
  try {
    const score = await goodPg.query(
      `
        SELECT COUNT("score") AS total_count, SUM("score") AS total_score
        FROM "CachedProfileScore"
        WHERE "score" IS NOT NULL;      
      `,
      [req.query.id as string]
    );

    return res.status(200).json({
      cached: score[0].total_count,
      success: true,
      volume: score[0].total_score
    });
  } catch (error) {
    catchedError(res, error);
  }
};
