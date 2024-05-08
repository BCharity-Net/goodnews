import type { Handler } from 'express';

import { Errors } from '@good/data/errors';
import logger from '@good/helpers/logger';
import catchedError from 'src/helpers/catchedError';
import prisma from 'src/helpers/prisma';
import { invalidBody, noBody } from 'src/helpers/responses';
import { object, string } from 'zod';

type ExtensionRequest = {
  secret: string;
};

const validationSchema = object({
  secret: string()
});

export const post: Handler = async (req, res) => {
  const { body } = req;

  if (!body) {
    return noBody(res);
  }

  const validation = validationSchema.safeParse(body);

  if (!validation.success) {
    return invalidBody(res);
  }

  const { secret } = body as ExtensionRequest;

  if (secret !== process.env.SECRET) {
    return res
      .status(400)
      .json({ error: Errors.InvalidSecret, success: false });
  }

  try {
    // Cleanup Email Tokens
    const { count } = await prisma.email.updateMany({
      data: { tokenExpiresAt: null, verificationToken: null, verified: false },
      where: { tokenExpiresAt: { lt: new Date() } }
    });
    logger.info(`Cleaned up ${count} email tokens that are expired`);

    return res.status(200).json({ success: true });
  } catch (error) {
    return catchedError(res, error);
  }
};
