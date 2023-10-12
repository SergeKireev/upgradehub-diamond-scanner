import { ApiName } from "ethereum-sources-downloader";
import { DbClient } from "../../../io/db/dbclient";
import { DiamondEvent } from "../../../interfaces/block_data";

export class UpgradesDisplayView {
  private dbClient: DbClient;
  constructor(dbClient: DbClient) {
    this.dbClient = dbClient;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  set<V>(id: number, key: string, value: V): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async delete(proxy_address: string, network: ApiName) {
    if (!proxy_address || !network) {
      return;
    }
    await this.dbClient.executeQuery(
      `DELETE FROM upgrades where proxy_address=$1 and network=$2`,
      [proxy_address, network]
    );
  }

  async fetchImplAddresses(
    address: string,
    network: ApiName
  ): Promise<string[]> {
    const query = `SELECT DISTINCT new_impl as address from diamond_events where address=$1 and network=$2;`;
    const result = await this.dbClient
      .executeQuery<DiamondEvent>(query, [address, network])
      .catch(console.error);
    if (result) {
      return result.rows.map((x) => x.address);
    }
    return [];
  }
}
