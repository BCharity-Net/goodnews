import type { Handler } from 'express';

import logger from '@good/helpers/logger';
import lensPg from 'src/db/lensPg';
import catchedError from 'src/helpers/catchedError';
import { SWR_CACHE_AGE_10_MINS_30_DAYS } from 'src/helpers/constants';
import { noBody } from 'src/helpers/responses';

// TODO: add tests
export const get: Handler = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return noBody(res);
  }

  try {
    const [globalStats, notificationStats] = await lensPg.multi(
      `
        SELECT 
          total_posts,
          total_comments,
          total_mirrors,
          total_quotes,
          total_publications,
          total_reacted,
          total_reactions,
          total_collects,
          total_acted
        FROM global_stats.profile
        WHERE profile_id = $1;
        SELECT COUNT(*) as total_notifications
        FROM notification.record
        WHERE notification_receiving_profile_id = $1;
      `,
      [id]
    );

    if (!globalStats[0]) {
      return res.status(404).json({ success: false });
    }

    const result = {
      ...globalStats[0],
      total_notifications: Number(notificationStats[0]?.total_notifications)
    };

    logger.info(`Lens: Fetched global profile stats for ${id}`);

    return res
      .status(200)
      .setHeader('Cache-Control', SWR_CACHE_AGE_10_MINS_30_DAYS)
      .json({ result, success: true });
  } catch (error) {
    catchedError(res, error);
  }
};
