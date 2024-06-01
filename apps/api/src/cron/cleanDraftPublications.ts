import logger from '@good/helpers/logger';
import prisma from 'src/helpers/prisma';

const cleanDraftPublications = async () => {
  const { count } = await prisma.draftPublication.deleteMany({
    where: {
      updatedAt: { lt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) }
    }
  });
  logger.info(
    `Cron: Cleaned up ${count} draft publications that are older than 100 days`
  );
};

export default cleanDraftPublications;
