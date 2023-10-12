import { SimpleDiff } from "../../../interfaces/simple_diff";
import { ApiName } from "ethereum-sources-downloader";
import { DbClient } from "../../../io/db/dbclient";
import { InitializableRepository } from "../initializable_repository";

const tableName = "simple_diffs";

export const createTable = `
CREATE TABLE IF NOT EXISTS ${tableName} (
    id serial PRIMARY KEY,
    proxy_impl varchar(42) NOT NULL,
    current_impl varchar(42) NOT NULL,
    previous_impl varchar(42) NOT NULL,
    diff text,
    network varchar(42) NOT NULL
);`;

export const toLowerCurrent = `
    UPDATE ${tableName}
    SET current_impl = LOWER(current_impl);
`;

export const toLowerPrevious = `
    UPDATE ${tableName}
    SET previous_impl = LOWER(previous_impl);
`;

export class SimpleDiffRepository extends InitializableRepository<SimpleDiff> {
  protected dbClient: DbClient;

  constructor(dbClient: DbClient) {
    super();
    this.dbClient = dbClient;
  }

  async save(simpleDiff: SimpleDiff): Promise<number> {
    const result = await this.dbClient.executeQuery<SimpleDiff>(
      `INSERT INTO ${tableName}(
            proxy_impl,
            current_impl,
            previous_impl,
            diff,
            network
        ) VALUES (
            $1, 
            $2,
            $3,
            $4,
            $5
        ) RETURNING id;`,
      [
        simpleDiff.proxy_impl.toLowerCase(),
        simpleDiff.current_impl.toLowerCase(),
        simpleDiff.previous_impl.toLowerCase(),
        simpleDiff.diff,
        simpleDiff.network,
      ]
    );

    if (result?.rows?.length === 1) {
      return result.rows[0].id || -1;
    } else {
      return Promise.reject("Insertion did not return any rows");
    }
  }

  async fetch(
    currentImpl: string,
    previousImpl: string,
    network: ApiName
  ): Promise<SimpleDiff[]> {
    const result = await this.dbClient.executeQuery<SimpleDiff>(
      `SELECT * FROM ${tableName} 
            WHERE current_impl=$1
            AND previous_impl=$2
            AND network=$3`,
      [currentImpl, previousImpl, network]
    );

    if (result) {
      return result.rows;
    }
    return [];
  }

  async fetchByProxy(
    proxyImpl: string,
    network: ApiName
  ): Promise<SimpleDiff[]> {
    const result = await this.dbClient.executeQuery<SimpleDiff>(
      `SELECT * FROM ${tableName} 
            WHERE proxy_impl=$1 
            AND network=$2`,
      [proxyImpl.toLowerCase(), network]
    );
    return result.rows || [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async set<V>(id: number, key: string, value: V): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async init(): Promise<void> {
    await super.init();
    await this.dbClient.executeQuery(createTable);
    await this.dbClient.executeQuery(toLowerCurrent);
    await this.dbClient.executeQuery(toLowerPrevious);
  }
}
