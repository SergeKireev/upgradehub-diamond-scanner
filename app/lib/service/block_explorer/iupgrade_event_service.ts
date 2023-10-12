import { Response } from "../../interfaces/response";

export interface PreviousImplResult {
  prevImplAddress: string | undefined;
  //This is the first event we see for the address
  isFirstEvent: boolean;
}

export interface IUpgradeEventService {
  findPreviousImplementation(
    address: string,
    implementation: string,
    transactionHash: string,
    logIndex: number
  ): Promise<Response>;
}
