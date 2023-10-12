import { ApiName } from "ethereum-sources-downloader";
import { Logger } from "../../io/log/Logger";
import { ContractCodeService } from "./contract_code_service";

export class FacetNameHandler {
  logger: Logger;
  contractCodeService: ContractCodeService;

  constructor(contractCodeService: ContractCodeService) {
    this.logger = new Logger("facet handler" as ApiName);
    this.contractCodeService = contractCodeService;
  }

  async handle(address: string, network: ApiName): Promise<string | undefined> {
    if (address === "0x0000000000000000000000000000000000000000") {
      return undefined;
    }
    const name = await this.contractCodeService
      .setName(address, network)
      .catch(() => undefined);
    return name;
  }
}
