import type { Response } from 'express';

import { Errors } from '@good/data/errors';
import logger from '@good/helpers/logger';
import * as Sentry from '@sentry/node';

const catchedError = (res: Response, error: any) => {
  logger.error(error);
  Sentry.captureException(error);

  return res
    .status(500)
    .json({ error: Errors.SomethingWentWrong, message: error, success: false });
};

export default catchedError;
