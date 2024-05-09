import type { IDatabase, IFormatting, IHelpers, IMain } from 'pg-promise';
import type { IConnectionParameters } from 'pg-promise/typescript/pg-subset';
import type pg from 'pg-promise/typescript/pg-subset';

import logger from '@good/helpers/logger';
import pgPromise from 'pg-promise';

type DatabaseInstance = IDatabase<unknown, pg.IClient>;

interface InitializeDbResult {
  instance: DatabaseInstance;
  pg: IMain<unknown, pg.IClient>;
}

type DatabaseParams = null | Record<string, any>;
type DatabaseQuery = string;

class Database {
  private _connectionBase: IConnectionParameters = {
    connectionString: process.env.DATABASE_URL,
    idleTimeoutMillis: 30000,
    max: 100
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
        logger.error(`GOOD POSTGRES ERROR WITH TRACE: ${errorMessage}`);
      }
    });

    return {
      instance: pgp(connectionParameters),
      pg: pgp
    };
  }

  public async exists(
    query: DatabaseQuery,
    params: DatabaseParams = null
  ): Promise<boolean> {
    const result = await this.oneOrNone(query, params);
    return result !== null;
  }

  public multi(
    query: DatabaseQuery,
    params: DatabaseParams = null
  ): Promise<any[][]> {
    return this._readDb.multi(query, params);
  }

  public oneOrNone(
    query: DatabaseQuery,
    params: DatabaseParams = null
  ): Promise<null | Record<string, any> | Record<string, any>[]> {
    return this._readDb.oneOrNone<Record<string, any> | Record<string, any>[]>(
      query,
      params
    );
  }

  public query(
    query: DatabaseQuery,
    params: DatabaseParams = null
  ): Promise<any[]> {
    return this._readDb.query(query, params);
  }
}

export default new Database();
