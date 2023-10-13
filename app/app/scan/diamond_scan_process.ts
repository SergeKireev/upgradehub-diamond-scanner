import { ApiName } from "ethereum-sources-downloader";
import { AppConfig, Config } from "../../config/config_handler";
import { PostgresClient } from "../../lib/io/db/postgres_client";
import { SqliteClient } from "../../lib/io/db/sqlite_client";
import {
  DIAMOND_CUT_TOPIC,
  DIAMOND_CUT_TOPIC_FREEZE,
} from "../../lib/interfaces/slots";
import { DiamondEventsRepository } from "../../lib/service/repository/events/diamond_events_repository";
import { DiamondCutAgent } from "../agents/diamond_cut_agent";
import { DiamondAgentFactory } from "../agents/factory/diamond_agent_factory";
import { BeAddressScanProvider } from "../provider/contract_scan/be_address_scan_provider";
import { CodeRepository } from "../../lib/service/repository/code/code_repository";
import { SimpleDiffRepository } from "../../lib/service/repository/diff/simple_diff_repository";

const config: AppConfig = Config.load();

const dbClient =
  config.db.type === "postgres"
    ? new PostgresClient(config.db)
    : new SqliteClient(config.db);
const diamondCutEventRepository = new DiamondEventsRepository(dbClient);
const codeRepository = new CodeRepository(dbClient);
const diffRepository = new SimpleDiffRepository(dbClient);

const ZKSYNC_ERA_DIAMOND_PROXY = "0x32400084c286cf3e17e7b677ea9583e60a000324";

/**
 * Script used to scan one diamond proxy address
 */
export async function launch() {
  await diamondCutEventRepository.init();
  await codeRepository.init();
  await diffRepository.init();

  const network: ApiName = config.scan.network;
  const address = config.scan.address; // zksync era
  const agentFactory = new DiamondAgentFactory();
  const diamondAgent: DiamondCutAgent = await agentFactory.create({
    network,
    appConfig: config,
    diamondEventsRepository: diamondCutEventRepository,
    codeRepository: codeRepository,
    diffRepository: diffRepository,
  });

  //Zksync diamond has a non standard event, with additional freeze parameter
  const diamondEventTopic0 =
    address.toLowerCase() === ZKSYNC_ERA_DIAMOND_PROXY
      ? DIAMOND_CUT_TOPIC_FREEZE
      : DIAMOND_CUT_TOPIC;

  //Clean up the events
  await diamondCutEventRepository.delete(address, network);
  const addressScanProvider = new BeAddressScanProvider(
    diamondEventTopic0,
    network,
    address
  );
  await addressScanProvider.attach(diamondAgent);
  console.log("Open", `http://localhost:3001/diamond/${network}/${address}`);
}
