import { ApiName } from "ethereum-sources-downloader";

export interface EventData {
  blockNumber: string;
  timeStamp: string;
  address: string;
  topics: string[];
  data: string;
  transactionHash: string;
  logIndex: string;
  transactionIndex: string;
}

export interface DiamondEvent {
  id?: number;
  address: string;
  new_impl: string;
  action: number;
  selector: string;
  function_sig?: string;
  network: ApiName;
  tx_hash: string;
  block_number: number;
  log_index: number;
  tx_index: number;
  ts: number;
}
