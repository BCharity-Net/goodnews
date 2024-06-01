import logger from '@good/helpers/logger';
import createClickhouseClient from 'src/helpers/createClickhouseClient';

const clickhouse = createClickhouseClient();

const cleanClickhouse = async () => {
  await clickhouse.command({
    query: "ALTER TABLE events DELETE WHERE url NOT LIKE '%bcharity.net%';"
  });
  logger.info('Cron: Cleaned non bcharity.net events from Clickhouse');
};

export default cleanClickhouse;
