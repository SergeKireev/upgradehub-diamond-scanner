import { ContractInfo } from "ethereum-sources-downloader";

const notVerified = (info: ContractInfo) => {
  return (
    !info.SourceCode ||
    (!info.ContractName && info.ABI === "Contract source code not verified")
  );
};

export const isVerifiedContractResponses = (info: ContractInfo) => {
  return !notVerified(info);
};
