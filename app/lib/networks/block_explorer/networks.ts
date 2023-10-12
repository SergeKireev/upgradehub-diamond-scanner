import { ApiName } from "ethereum-sources-downloader";

export const explorerSiteUrls = {
  etherscan: "https://etherscan.io",
  bscscan: "https://bscscan.com",
  hecoinfo: "https://hecoinfo.com",
  ftmscan: "https://ftmscan.com",
  polygonscan: "https://polygonscan.com",
  "optimistic.etherscan": "https://optimistic.etherscan.io",
  arbiscan: "https://arbiscan.io",
  snowtrace: "https://snowtrace.io",
  cronoscan: "https://cronoscan.com",
  moonbeam: "https://moonscan.io",
  aurora: "https://aurorascan.dev",
  basescan: "https://basescan.org",
};

const ETHERSCAN_KEY = "VF2KAPS8PQ43TKAH43GBSKQX2H2PBYEP17";
const OPTIMISM_KEY = "9MYGJVEVBDFF7XQF9IY15CZNM636S6NJGV";
const BSCSCAN_KEY = "YPDMAMN2WBVZY7RQTV4FZMZZZBKTN7KXBN";
const FTMSCAN_KEY = "EH9NPZVF1HMNAQMAUZKA4VF7EC23X37DGS";
const HECOINFO_KEY = "XEUTJF2439EP4HHD23H2AFEFQJHFGSG57R";
const SNOWTRACE_KEY = "HQXUR1MTNEDGHVD1BGTGSJIFEJ75PQY8CR";
const ARBISCAN_KEY = "X3ZWJBXC14HTIR3B9DNYGEUICEIKKZ9ENZ";
const POLYGONSCAN_KEY = "677FSQ7RXE8PA444XDZ54NXHHGFPI44YNA";
const CRONOSCAN_KEY = "BGAN1CWT8E1A2XRS3FU61UP7XXFMHBWNSY";
const MOONBEAM_KEY = "FENPKQI49RF2P916SQ2J58BTDMU69PQY8Y";
const AURORA_KEY = "F2JS84SQHM53V4T3AN2CSX6ZHUAXFSHJ8Y";
const BASESCAN_KEY = "ICQQDUA1C8R2EZY6M4QIIV7WUEZM8INNA7";

export const attemptRetryApiKeys: Record<ApiName, string> = {
  polygonscan: "FFB1Q4ISGBC56AQNYRAKRNKRR3GHYIHYZ6",
  etherscan: "B5K725K78N2NZ1RS558QDM8SJBFYUE38UJ",
  "ropsten.etherscan": ETHERSCAN_KEY,
  "rinkeby.etherscan": ETHERSCAN_KEY,
  "goerli.etherscan": ETHERSCAN_KEY,
  "kovan.etherscan": ETHERSCAN_KEY,
  bscscan: "FQWH6RZD8VGT5MJ62DEMW7HF6EI288NINP",
  "testnet.bscscan": BSCSCAN_KEY,
  hecoinfo: HECOINFO_KEY,
  "testnet.hecoinfo": HECOINFO_KEY,
  ftmscan: "FKW9UE6R9XA2ITYNDB1VCFETU6WTNXVU79",
  "testnet.ftmscan": FTMSCAN_KEY,
  "optimistic.etherscan": OPTIMISM_KEY,
  "kovan-optimistic.etherscan": ETHERSCAN_KEY,
  "testnet.polygonscan": POLYGONSCAN_KEY,
  arbiscan: ARBISCAN_KEY,
  "testnet.arbiscan": ARBISCAN_KEY,
  snowtrace: "DYDGR665SPJPT6JH6YVBI1M85N7Z2J8G16",
  "testnet.snowtrace": SNOWTRACE_KEY,
  cronoscan: CRONOSCAN_KEY,
  moonbeam: MOONBEAM_KEY,
  aurora: AURORA_KEY,
  basescan: BASESCAN_KEY,
  "goerli.basescan": BASESCAN_KEY,
};

type Network =
  | "avalanche"
  | "ethereum"
  | "fantom"
  | "bsc"
  | "polygon"
  | "arbitrum"
  | "moon"
  | "base";

export const networkToApiName: Record<Network, ApiName> = {
  avalanche: "snowtrace",
  ethereum: "etherscan",
  fantom: "ftmscan",
  bsc: "bscscan",
  polygon: "polygonscan",
  arbitrum: "arbiscan",
  moon: "moonbeam",
  base: "basescan",
};
