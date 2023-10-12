import { ApiName } from "ethereum-sources-downloader";

export interface BeaconEntry {
  id?: number;
  network: ApiName;
  proxy_address: string;
  beacon: string;
}
