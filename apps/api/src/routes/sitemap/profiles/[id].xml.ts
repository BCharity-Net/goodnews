import type { Handler } from 'express';

import logger from '@good/helpers/logger';
import lensPg from 'src/db/lensPg';
import catchedError from 'src/helpers/catchedError';
import { SITEMAP_BATCH_SIZE } from 'src/helpers/constants';
import { noBody } from 'src/helpers/responses';
import { buildUrlsetXml } from 'src/helpers/sitemap/buildSitemap';

export const config = {
  api: { responseLimit: '8mb' }
};

export const get: Handler = async (req, res) => {
  const batch = req.path.replace('/sitemap/profiles/', '');

  if (!batch) {
    return noBody(res);
  }

  const user_agent = req.headers['user-agent'];

  try {
    const offset = (Number(batch) - 1) * SITEMAP_BATCH_SIZE || 0;

    const response = await lensPg.query(
      `
        SELECT h.local_name, hl.block_timestamp
        FROM namespace.handle h
        JOIN namespace.handle_link hl ON h.handle_id = hl.handle_id
        JOIN profile.record p ON hl.token_id = p.profile_id
        WHERE p.is_burnt = false
        ORDER BY p.block_timestamp
        LIMIT $1
        OFFSET $2;
      `,
      [SITEMAP_BATCH_SIZE, offset]
    );

    const entries = response.map((handle) => ({
      lastmod: handle.block_timestamp
        .toISOString()
        .replace('T', ' ')
        .replace('.000Z', '')
        .split(' ')[0],
      loc: `https://bcharity.net/u/${handle.local_name}`
    }));

    const xml = buildUrlsetXml(entries);

    logger.info(
      `Lens: Fetched profiles sitemap for batch ${batch} having ${response.length} entries from user-agent: ${user_agent}`
    );

    return res.status(200).setHeader('Content-Type', 'text/xml').send(xml);
  } catch (error) {
    return catchedError(res, error);
  }
};
