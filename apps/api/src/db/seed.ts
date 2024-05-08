import logger from '@good/helpers/logger';
import { PrismaClient } from '@prisma/client';

import seedAllowedTokens from './seeds/seedAllowedTokens';
import seedFeatureFlags from './seeds/seedFeatureFlags';
import seedMembershipNfts from './seeds/seedMembershipNfts';
import seedPolls from './seeds/seedPolls';
import seedPreferences from './seeds/seedPreferences';
import seedProfileFeatures from './seeds/seedProfileFeatures';
import seedScorableEvents from './seeds/seedScorableEvents';

export const prisma = new PrismaClient();

async function main() {
  const featureFlags = await seedFeatureFlags();
  logger.info(`Seeded ${featureFlags} feature flags`);

  const profileFeatures = await seedProfileFeatures();
  logger.info(`Seeded ${profileFeatures} profile features`);

  const preferences = await seedPreferences();
  logger.info(`Seeded ${preferences} preferences`);

  const allowedTokens = await seedAllowedTokens();
  logger.info(`Seeded ${allowedTokens} allowed tokens`);

  const poll = await seedPolls();
  logger.info(`Seeded ${poll} poll`);

  const membershipNft = await seedMembershipNfts();
  logger.info(`Seeded ${membershipNft} membership nft`);

  const scorableEvents = await seedScorableEvents();
  logger.info(`Seeded ${scorableEvents} scorable events`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
