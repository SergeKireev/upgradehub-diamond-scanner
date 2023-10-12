import { saveContractFilesToFs } from "ethereum-sources-downloader";
import { expect } from "chai";

const EmptyLogger = {
  log: () => {},
};

const EmptyFileSystem = {
  // eslint-disable-next-line
  outputFile: (file: string, data: any, callback: (err: string) => void) => {
    return Promise.resolve();
  },
};

describe("Check fetch library", () => {
  it("Not verified", async () => {
    const contractAddress = "0x50361bacbefe3c352a6ae695dc98f21563c8d5d6";
    const info = await saveContractFilesToFs(
      EmptyFileSystem,
      "bscscan",
      contractAddress,
      EmptyLogger,
      ""
    );
    expect(info[0][0][0]).to.be.equals("error.md");
    expect(info[0][0][1].substring(0, 5)).to.be.equals("Oops!");
  });

  it("Verified", async () => {
    const contractAddress = "0x77f50d741997dbbbb112c58dec50315e2de8da58";
    await saveContractFilesToFs(
      EmptyFileSystem,
      "bscscan",
      contractAddress,
      EmptyLogger,
      ""
    );
  });
});
