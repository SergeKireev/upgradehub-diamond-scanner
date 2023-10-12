import { networkNames } from "ethereum-sources-downloader";

type Network = keyof typeof networkNames;

export interface AddressScan {
  id?: string;
  proxy_address: string;
  network: Network;
  requested: boolean;
  latest_update_ts: number;
  creation_ts: number;
  upgrade_event_nb: number;
  forced: boolean;
  to_delete: boolean;
}
