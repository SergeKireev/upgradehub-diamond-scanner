import { expect } from "chai";
import { BigNumber } from "ethers";
import { EventData } from "../../../lib/interfaces/block_data";
import { formatEvent } from "../../../lib/utils/format";

describe("Formatting", () => {
  it("address should be lower case", async () => {
    const baseEvent: EventData = {
      address: "",
      blockNumber: "0x0",
      timeStamp: "0x0",
      data: "",
      logIndex: "0x0",
      topics: [],
      transactionHash: "",
      transactionIndex: "0x0",
    };
    const event: EventData = {
      ...baseEvent,
      address: "0xFFFF",
    };
    formatEvent(event);
    expect(event.address).to.be.equals(event.address.toLowerCase());
  }).timeout(40000);

  it("logIndex and transactionIndex should be zero", async () => {
    const baseEvent: EventData = {
      address: "",
      blockNumber: "0x0",
      timeStamp: "0x0",
      data: "",
      logIndex: "0x0",
      topics: [],
      transactionHash: "",
      transactionIndex: "0x0",
    };
    const event: EventData = {
      ...baseEvent,
      logIndex: "0x",
      transactionIndex: "0x",
    };

    formatEvent(event);
    //No exception should be thrown here
    BigNumber.from(event.logIndex);
    BigNumber.from(event.transactionIndex);
  }).timeout(40000);
});
