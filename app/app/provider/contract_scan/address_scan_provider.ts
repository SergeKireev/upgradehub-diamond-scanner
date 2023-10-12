import { ApiName } from "ethereum-sources-downloader";
import { EventData } from "../../../lib/interfaces/block_data";
import { Logger } from "../../../lib/io/log/Logger";
import { Agent } from "../../agents/agent";
import { Provider } from "../provider";

export abstract class AddressScanProvider<T> implements Provider<EventData, T> {
  networks: ApiName[] = [
    "etherscan",
    "optimistic.etherscan",
    "arbiscan",
    "bscscan",
    "ftmscan",
    "polygonscan",
    "snowtrace",
    "cronoscan",
    "moonbeam",
    "aurora",
  ];

  previousEvent?: EventData;
  network: ApiName;
  address: string;
  logger: Logger;

  constructor(network: ApiName, address: string) {
    this.network = network;
    this.address = address;
    this.logger = new Logger(this.network);
  }

  getPreviousEvent(): EventData | undefined {
    return this.previousEvent;
  }

  abstract fetchEventPage(
    fromBlock: number,
    toBlock: number | string
  ): Promise<EventData[]>;

  async scanEvents(
    agent: Agent<EventData, T>,
    fromBlock: number,
    toBlock: number
  ) {
    const logger = this.logger;
    logger.log("Fetching events page from ", fromBlock, "to", toBlock);
    //Typically a contract has less than 100 events, so it should not be problematic to fetch in one go
    const eventsInPage = await this.fetchEventPage(fromBlock, toBlock);
    console.log("Events found", eventsInPage.length);
    let i = 0;
    while (i < eventsInPage.length) {
      const currentEvent = eventsInPage[i];
      logger.log(
        "Processing",
        this.address,
        currentEvent.blockNumber,
        currentEvent.transactionIndex,
        currentEvent.logIndex
      );

      //Event existence is already checked in agent
      logger.log(
        "Calling agent on Event",
        this.address,
        currentEvent.blockNumber,
        currentEvent.transactionIndex,
        currentEvent.logIndex
      );
      await agent.callback(currentEvent).catch((e) => {
        logger.error(e);
      });
      this.previousEvent = currentEvent;
      i++;
    }
  }

  async attachHelper(agent: Agent<EventData, T>): Promise<void> {
    return this.scanEvents(agent, 0 /*blockCursor*/, 0 /*latestBlock*/);
  }

  attach(agent: Agent<EventData, T>): Promise<void> {
    return this.attachHelper(agent);
  }
}
