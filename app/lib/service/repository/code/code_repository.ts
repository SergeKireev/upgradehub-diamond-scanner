import { CodeSource, VerifiedStatus } from "../../../interfaces/code_source";
import { ApiName } from "ethereum-sources-downloader";
import { DbClient } from "../../../io/db/dbclient";
import { InitializableRepository } from "../initializable_repository";

const tableName = `sources`;

export const createTable = `
CREATE TABLE IF NOT EXISTS ${tableName} (
    id serial PRIMARY KEY,
    address varchar(42) NOT NULL,
    text text,
    network varchar(42) NOT NULL,
    ts bigint DEFAULT 0,
    name text
);`;

export const dropTable = `DROP TABLE IF EXISTS ${tableName};`;

export class CodeRepository extends InitializableRepository<CodeSource> {
  protected dbClient: DbClient;

  constructor(dbClient: DbClient) {
    super();
    this.dbClient = dbClient;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  set<V>(id: number, key: string, value: V): Promise<void> {
    throw new Error("Method not implemented.");
  }

  setByAddress(
    address: string,
    network: ApiName,
    key: string,
    value: string | number
  ): Promise<void> {
    return this.dbClient
      .executeQuery(
        `UPDATE ${tableName} SET
                ${key}=$1
                WHERE
                address=$2 AND
                network=$3
            `,
        [value, address.toLowerCase(), network]
      )
      .then();
  }

  async destroy() {
    await this.dbClient.executeQuery(dropTable);
  }

  async init() {
    await super.init();
    await this.dbClient.executeQuery(createTable);
  }

  async save(source: CodeSource): Promise<number> {
    const result = await this.dbClient.executeQuery<CodeSource>(
      `INSERT INTO sources(
                address,
                network,
                text,
                ts,
                name
            ) VALUES (
                $1, 
                $2,
                $3,
                $4,
                $5
            ) RETURNING id;`,
      [
        source.address.toLowerCase(),
        source.network,
        source.text,
        source.ts,
        source.name || "",
      ]
    );
    if (result?.rows?.length === 1) {
      return result.rows[0].id || -1;
    } else {
      return Promise.reject("Insertion did not return any rows");
    }
  }

  async fetchVerifiedSource(
    address: string,
    network: string
  ): Promise<CodeSource | undefined> {
    let addressClause = "true";
    let args: string[] = [];
    const clauses: string[] = [];
    if (address) {
      clauses.push(`address=$${clauses.length + 1}`);
      args = [address.toLowerCase()];
    }

    if (network) {
      clauses.push(`network=$${clauses.length + 1}`);
      if (!args) {
        args = [];
      }
      args.push(network.toLowerCase());
    }
    if (clauses.length) addressClause = clauses.join(" AND ");

    const query = `SELECT * FROM sources WHERE ${addressClause} ORDER BY id DESC limit 10`;

    const result = await this.dbClient
      .executeQuery<CodeSource>(query, args)
      .catch(console.error);
    if (result) {
      return result.rows[0];
    } else {
      return undefined;
    }
  }

  async fetchVerifiedStatus(
    addresses: string[],
    network: string
  ): Promise<VerifiedStatus[] | undefined> {
    const query = `
        SELECT address, 
        COALESCE(text <> '', false) as verified, 
        $1 as network, 
        name FROM sources s 
        WHERE address IN (${addresses.map((x) => `'${x}'`).join(",")});`;
    const result = await this.dbClient
      .executeQuery<VerifiedStatus>(query, [network])
      .catch(console.error);
    if (result) return result.rows;
    else return undefined;
  }
}
