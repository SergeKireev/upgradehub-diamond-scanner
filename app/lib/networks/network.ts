import {
  ApiName,
  explorerApiKeys,
  explorerApiUrls,
  networkNames,
} from "ethereum-sources-downloader";

export type BlockexplorerNetwork = keyof typeof networkNames;

export interface BlockexplorerSettings {
  name: BlockexplorerNetwork;
  url: string;
  apiKey: string;
}

export const getBlockExplorerSettings = (
  network: ApiName,
  apiKeysMap?: Record<ApiName, string>
): BlockexplorerSettings => {
  apiKeysMap = apiKeysMap ? apiKeysMap : explorerApiKeys;
  return {
    name: network,
    apiKey: apiKeysMap[network],
    url: explorerApiUrls[network],
  };
};
