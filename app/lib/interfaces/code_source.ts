import { ApiName } from "ethereum-sources-downloader";

export interface CodeSource {
  id?: number;
  address: string;
  text: string;
  network: ApiName;
  name?: string;
  ts: number;
}

export interface VerifiedStatus {
  address: string;
  network: ApiName;
  verified: boolean;
  name: string;
}
