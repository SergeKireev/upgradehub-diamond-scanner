import { ApiName } from "ethereum-sources-downloader";

export interface FacetName {
  id?: number;
  network: ApiName;
  address: string;
  name: string;
}
