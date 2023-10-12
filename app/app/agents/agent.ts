import { ApiName } from "ethereum-sources-downloader";
import { BigNumber } from "ethers";
import { EventData } from "../../lib/interfaces/block_data";
import { WithTxData } from "../../lib/interfaces/tx";
import { Feed } from "../feeds/feed";

export interface Agent<E, T> {
  network: ApiName;
  attachFeed(feed: Feed<T>);
  callback(eventLog: E): Promise<void>;
}

/**
 * The agent is notified by provider upon receiving an event and processes it.
 * In the context of upgrades, an event contains the address of the new implementation,
 * so the agent compares to previously seen data to compute the diff
 */
export abstract class EventDataAgent<T> implements Agent<EventData, T> {
  abstract network: ApiName;

  parseTxData(blockData: EventData): WithTxData {
    function format(n: string): number {
      const tmp = n === "0x" ? 0 : n || 0;
      return BigNumber.from(tmp).toNumber();
    }

    const blockNumber = format(blockData.blockNumber);
    const logIndex = format(blockData.logIndex);
    const transactionIndex = format(blockData.transactionIndex);
    const timestamp = format(blockData.timeStamp);
    const txData: WithTxData = {
      block_number: blockNumber,
      log_index: logIndex,
      tx_hash: blockData.transactionHash,
      tx_index: transactionIndex,
      ts: timestamp,
    };
    return txData;
  }

  abstract callback(eventLog: EventData): Promise<void>;

  /**
   * Can be used to output results of the processing to a telegram/discord bot
   * @param feed
   */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  attachFeed(feed: Feed<T>) {
    throw new Error("Method not implemented.");
  }
}
