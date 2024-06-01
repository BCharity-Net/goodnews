import type { IDatabase, IFormatting, IHelpers, IMain } from 'pg-promise';
import type pg from 'pg-promise/typescript/pg-subset';
import type { IConnectionParameters } from 'pg-promise/typescript/pg-subset';

import logger from '@good/helpers/logger';
import dotenv from 'dotenv';
import pgPromise from 'pg-promise';

dotenv.config({ override: true });

type DatabaseInstance = IDatabase<unknown, pg.IClient>;

interface InitializeDbResult {
  instance: DatabaseInstance;
  pg: IMain<unknown, pg.IClient>;
}

type DatabaseParams = null | Record<string, any>;
type DatabaseQuery = string;

class Database {
  private _connectionBase: IConnectionParameters = {
    database: 'social_production_lens_v2_polygon',
    host: 'lens.bcharity.net',
    idleTimeoutMillis: 30000,
    max: 1500,
    password: process.env.LENS_DATABASE_PASSWORD,
    port: 6969,
    user: 'good'
  };

  private _readDb: DatabaseInstance;
  public as: IFormatting;
  public helpers: IHelpers;

  constructor() {
    const readDb = this._initializateDb();
    this._readDb = readDb.instance;
    this.helpers = readDb.pg.helpers;
    this.as = readDb.pg.as;
  }

  private _initializateDb(): InitializeDbResult {
    return this._initializationDb(this._connectionBase);
  }

  private _initializationDb(
    connectionParameters: IConnectionParameters
  ): InitializeDbResult {
    const pgp = pgPromise({
      error: (error: any) => {
        const errorMessage = error.message || error;
        logger.error(`LENS POSTGRES ERROR WITH TRACE: ${errorMessage}`);
      }
    });

    return {
      instance: pgp(connectionParameters),
      pg: pgp
    };
  }

  public multi(
    query: DatabaseQuery,
    params: DatabaseParams = null
  ): Promise<any[][]> {
    return this._readDb.multi(query, params);
  }

  public query(
    query: DatabaseQuery,
    params: DatabaseParams = null
  ): Promise<any[]> {
    return this._readDb.query(query, params);
  }
}

export default new Database();
