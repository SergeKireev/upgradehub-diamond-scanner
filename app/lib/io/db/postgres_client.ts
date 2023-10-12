import { DbClient, DbValue } from "./dbclient";
import { PostgresConfig } from "../../../config/config_handler";
//TODO: check if works
import { Pool } from "pg";

export class PostgresClient implements DbClient {
  private pool: Pool;

  constructor(config: PostgresConfig) {
    this.pool = new Pool({
      ...config,
      ssl: {
        rejectUnauthorized: false,
        ca: config.certificate,
      },
    });
  }

  async initialize(): Promise<void> {}

  executeQuery<T>(query: string, args: DbValue[]): Promise<T> {
    return this.pool.query(query, args);
  }
}
