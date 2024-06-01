import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';

import { CLICKHOUSE_URL } from './constants';

dotenv.config({ override: true });

const createClickhouseClient = (username?: string, password?: string) => {
  password = password || process.env.CLICKHOUSE_PASSWORD;
  username = username || 'default';

  return createClient({
    database: 'default',
    password,
    url: CLICKHOUSE_URL,
    username
  });
};

export default createClickhouseClient;
