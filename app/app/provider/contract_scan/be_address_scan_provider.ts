import {
  ApiName,
  explorerApiKeys,
  explorerApiUrls,
} from "ethereum-sources-downloader";
import { EventData } from "../../../lib/interfaces/block_data";
import { Logger } from "../../../lib/io/log/Logger";
import { AddressScanProvider } from "./address_scan_provider";

export class BeAddressScanProvider<T> extends AddressScanProvider<T> {
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

  logger: Logger;
  eventTopic: string;

  constructor(eventTopic: string, network: ApiName, address: string) {
    super(network, address);
    this.logger = new Logger(this.network);
    this.eventTopic = eventTopic;
  }

  async fetchEventPage(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromBlock: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toBlock: number | string
  ): Promise<EventData[]> {
    const logger = this.logger;
    const baseUrl = explorerApiUrls[this.network];
    const apiKey = explorerApiKeys[this.network];
    const queryUrl = `${baseUrl}?module=logs&action=getLogs&address=${this.address}&topic0=${this.eventTopic}&fromBlock=0&toBlock=latest&apikey=${apiKey}`;
    logger.log("Fetching events using url:", queryUrl);
    const response = await fetch(queryUrl).catch((e) => logger.error(e));
    if (response) {
      const data = await response.json().catch((e) => logger.error(e));
      if (!data || !data.result) {
        logger.error("latest events fetch", JSON.stringify(data, undefined, 2));
        return [];
      }
      if (data.result.length) {
        logger.log("Events", queryUrl);
      }
      if (data.result[0] !== undefined) {
        return data.result;
      }
    } else {
      logger.error("Empty response");
    }
    return [];
  }
}
