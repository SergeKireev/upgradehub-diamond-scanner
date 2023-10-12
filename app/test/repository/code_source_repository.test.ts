import { SqliteClient } from "../../lib/io/db/sqlite_client";
import { CodeSource } from "../../lib/interfaces/code_source";
import { CodeRepository } from "../../lib/service/repository/code/code_repository";

describe("CRUD for source codes", () => {
  it("save and find a downloaded source code", async () => {
    const dbClient = new SqliteClient({
      type: "sqlite",
    });
    const repository = new CodeRepository(dbClient);
    await repository.init();

    const PROXY_ADDRESS = "0xff";
    const NETWORK = "etherscan";
    const upgradeEvent: CodeSource = {
      address: PROXY_ADDRESS,
      network: NETWORK,
      ts: 123,
      text: "",
    };
    await repository.save(upgradeEvent);
  }).timeout(40000);
});
