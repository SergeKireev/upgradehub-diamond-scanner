import { ApiName } from "ethereum-sources-downloader";
import { DiamondEvent } from "../../../interfaces/block_data";
import { DbClient } from "../../../io/db/dbclient";
import { InitializableRepository } from "../initializable_repository";

const tableName = "diamond_events";

export const createTable = `
CREATE TABLE IF NOT EXISTS ${tableName} (
    id serial PRIMARY KEY,
    address varchar(42) NOT NULL,
    new_impl varchar(42) NOT NULL,
    action int NOT NULL,
    selector varchar(10) NOT NULL,
    function_sig text NOT NULL,
    network varchar(42) NOT NULL,
    tx_hash text,
    block_number int NOT NULL,
    log_index int NOT NULL,
    tx_index int NOT NULL,
    ts bigint NOT NULL
);`;

export const dropTable = `
DROP TABLE IF EXISTS ${tableName};`;

export class DiamondEventsRepository extends InitializableRepository<DiamondEvent> {
  protected dbClient: DbClient;
  constructor(dbClient: DbClient) {
    super();
    this.dbClient = dbClient;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  set<V>(id: number, key: string, value: V): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async destroy() {
    await this.dbClient.executeQuery(dropTable);
  }

  async init() {
    await super.init();
    await this.dbClient.executeQuery(createTable);
  }

  async delete(proxy_address: string, network: ApiName) {
    if (!proxy_address || !network) {
      return;
    }
    await this.dbClient.executeQuery(
      `DELETE FROM ${tableName} where address=$1 and network=$2`,
      [proxy_address.toLowerCase(), network.toLowerCase()]
    );
  }

  async save(diamondEvent: DiamondEvent): Promise<number> {
    const result = await this.dbClient.executeQuery<DiamondEvent>(
      `INSERT INTO ${tableName}(
                address,
                new_impl,
                action,
                selector,
                function_sig,
                network,
                tx_hash,
                block_number,
                log_index,
                tx_index,
                ts
            ) VALUES (
                $1, 
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11
            ) RETURNING id;`,
      [
        diamondEvent.address.toLowerCase(),
        diamondEvent.new_impl.toLowerCase(),
        diamondEvent.action,
        diamondEvent.selector.toLowerCase(),
        diamondEvent.function_sig || diamondEvent.selector.toLowerCase(),
        diamondEvent.network,
        diamondEvent.tx_hash,
        diamondEvent.block_number,
        diamondEvent.log_index,
        diamondEvent.tx_index,
        diamondEvent.ts,
      ]
    );
    if (result?.rows?.length === 1) {
      return result.rows[0].id || -1;
    } else {
      return Promise.reject("Insertion did not return any rows");
    }
  }

  async fetchDiamondCutEvents(
    address: string,
    network: string,
    tx_hash: string,
    log_index: number
  ): Promise<DiamondEvent[] | undefined> {
    const query = `SELECT * FROM ${tableName} WHERE address=$1 AND
            network=$2 AND
            tx_hash=$3 AND
            log_index=$4
            ORDER BY ts ASC limit 100`;
    const result = await this.dbClient
      .executeQuery<DiamondEvent>(query, [address, network, tx_hash, log_index])
      .catch(console.error);
    if (result) {
      return result.rows;
    }
    return [];
  }

  async fetchDiamondCutEventsForAddress(
    address: string,
    network: ApiName
  ): Promise<DiamondEvent[]> {
    const query = `SELECT * FROM ${tableName} WHERE address=$1 AND network=$2 ORDER BY ts ASC`;

    const result = await this.dbClient
      .executeQuery<DiamondEvent>(query, [address.toLowerCase(), network])
      .catch(console.error);
    if (result) {
      return result.rows;
    }
    return [];
  }

  async find(id: number) {
    const result = await this.dbClient
      .executeQuery(`SELECT * from ${tableName} where id=$1`, [id])
      .catch(console.error);
    if (result) {
      return result.rows;
    }
    return [];
  }
}
