import { networkNames } from "ethereum-sources-downloader";
import { WithDiff } from "./decorations";
import { WithTxData } from "./tx";

type Network = keyof typeof networkNames;

export interface DiamondCut {
  id?: number;
  proxy_address: string;
  selectors: string[];
  previous_impl: string;
  current_impl: string;
  ts: number;
  network: Network;
  tx_hash: string;
}

export type DiamondCutWithTx = DiamondCut & WithTxData;
export type DiamondCutWithTxAndDiff = DiamondCutWithTx & WithDiff;
export type DiamondCutWithTxAndDiffImmunefi = DiamondCutWithTxAndDiff;
