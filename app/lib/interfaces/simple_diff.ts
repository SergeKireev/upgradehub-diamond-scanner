import { ApiName } from "ethereum-sources-downloader";

export interface SimpleDiffJob {
  proxy_impl: string; //Not strictly necessary, but easier for joins
  current_impl: string;
  previous_impl: string;
  network: ApiName;
}

interface WithIdAndDiff {
  id?: number;
  diff: string;
}

export type SimpleDiff = SimpleDiffJob & WithIdAndDiff;
