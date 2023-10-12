import { BigNumber, BigNumberish } from "ethers";

export interface DecodedSignedTransaction {
  type: number;
  chainId: number;
  nonce: number;
  maxPriorityFeePerGas: BigNumberish;
  maxFeePerGas: BigNumberish;
  gasPrice: BigNumberish;
  gasLimit: BigNumberish;
  to: string;
  value: BigNumber;
  data: string;
  accessList: string[];
  hash: string;
  v: number;
  r: string;
  s: string;
  from: string;
}

export interface WithTxData {
  block_number: number;
  tx_hash: string;
  log_index: number;
  tx_index: number;
  ts: number;
}
