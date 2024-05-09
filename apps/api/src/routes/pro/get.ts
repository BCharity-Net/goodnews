import type { Handler } from 'express';

import { GoodPro } from '@good/abis';
import { GOOD_PRO, IS_MAINNET } from '@good/data/constants';
import logger from '@good/helpers/logger';
import goodPg from 'src/db/goodPg';
import catchedError from 'src/helpers/catchedError';
import getRpc from 'src/helpers/getRpc';
import prisma from 'src/helpers/prisma';
import { noBody } from 'src/helpers/responses';
import { createPublicClient } from 'viem';
import { polygon, polygonAmoy } from 'viem/chains';

export const get: Handler = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return noBody(res);
  }

  try {
    const pro = await goodPg.query(`SELECT * FROM "Pro" WHERE "id" = $1;`, [
      id as string
    ]);

    if (pro[0]?.expiresAt && new Date() < pro[0]?.expiresAt) {
      logger.info(`Fetched pro status from cache for ${id}`);

      return res.status(200).json({
        cached: true,
        result: { expiresAt: pro[0].expiresAt, isPro: true },
        success: true
      });
    }

    const client = createPublicClient({
      chain: IS_MAINNET ? polygon : polygonAmoy,
      transport: getRpc({ mainnet: IS_MAINNET })
    });

    const data = await client.readContract({
      abi: GoodPro,
      address: GOOD_PRO,
      args: [id],
      functionName: 'proExpiresAt'
    });

    const jsonData = JSON.parse(data as string);
    const expiresAt = new Date(jsonData * 1000);
    const expired = expiresAt < new Date();

    if (expired) {
      return res
        .status(404)
        .json({ result: { expiresAt: null, isPro: false }, success: true });
    }

    const baseData = { expiresAt: new Date(expiresAt), id: id as string };
    const newPro = await prisma.pro.upsert({
      create: baseData,
      update: baseData,
      where: { id: id as string }
    });

    const result = { expiresAt: newPro.expiresAt, isPro: true };

    logger.info(`Fetched pro status for ${id}`);

    return res.status(200).json({ result, success: true });
  } catch (error) {
    return catchedError(res, error);
  }
};
