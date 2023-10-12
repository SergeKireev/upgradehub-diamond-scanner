import { ApiName, saveContractFilesToFs } from "ethereum-sources-downloader";
import path from "path";
import { diff } from "../../diff/git_differ";
import { OkResponse } from "../../interfaces/response";
import fse, { mkdir } from "fs-extra";
import { Logger } from "../../io/log/Logger";
import { BlockexplorerSettings } from "../../networks/network";
import { wait } from "../../utils/wait";
import { CodeRepository } from "../repository/code/code_repository";
import { writeToDisk } from "../../io/file/write_to_disk";
import { CodeSource } from "../../interfaces/code_source";
import { AppConfig } from "../../../config/config_handler";
import { FileSystem } from "ethereum-sources-downloader/src/io/fs/filesystem";

const EmptyLogger = {
  log: () => {},
};

const DEFAULT_ERROR_RESPONSE = [[["error.md", "Oops!"]]];
export class ContractCodeService {
  config: AppConfig;
  beSettings: BlockexplorerSettings;
  codeRepository: CodeRepository;
  logger: Logger;

  constructor(
    config: AppConfig,
    beSettings: BlockexplorerSettings,
    repository: CodeRepository,
    logger: Logger
  ) {
    this.beSettings = beSettings;
    this.codeRepository = repository;
    this.logger = logger;
    this.config = config;
  }

  async fetchJsonWrapper<T>(url: string): Promise<OkResponse<T>> {
    const response = await fetch(url);
    const json = await response.json();
    return {
      status: "ok",
      data: json,
    };
  }

  checkVerifiedHelper(sources: string[][]): boolean {
    return !(
      sources[0][0] === "error.md" && sources[0][1].substring(0, 5) === "Oops!"
    );
  }

  async fetchSourceCode(
    network: ApiName,
    path: string,
    contractAddress: string
  ) {
    let entries = undefined;
    const beSettings = this.beSettings;
    try {
      const cachedEntries = await this.codeRepository.fetchVerifiedSource(
        contractAddress,
        network
      );
      if (cachedEntries) {
        this.logger.log("Found code source in cache", contractAddress);
        entries = JSON.parse(cachedEntries.text);
      }
    } catch (e) {
      this.logger.log(
        "Failed to fetch code entries from cache",
        contractAddress
      );
    }
    if (!entries) {
      const [entries, info] = await saveContractFilesToFs(
        fse as FileSystem,
        beSettings.name,
        contractAddress,
        EmptyLogger,
        path
      );
      const sourceCode: CodeSource = {
        address: contractAddress,
        network: network,
        text: JSON.stringify(entries),
        ts: Date.now(),
        name: info.ContractName,
      };
      const isVerified = this.checkVerifiedHelper(entries);
      if (isVerified) {
        await this.codeRepository.save(sourceCode);
      }
      return isVerified;
    } else {
      try {
        writeToDisk(EmptyLogger as Logger, entries, path);
        //We hit the cache, so the entry must be verified
        return true;
      } catch (e) {
        this.logger.log(
          "Failed to persist code entries to disk",
          contractAddress,
          e
        );
      }
    }
  }

  async setName(
    address: string,
    network: ApiName
  ): Promise<string | undefined> {
    const logger = this.logger;
    const source = await this.codeRepository.fetchVerifiedSource(
      address,
      network
    );
    const noopFse = {
      outputFile: async (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        file: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
        data: any,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        callback: (err: string) => void
      ) => {},
    };

    if (!source?.name) {
      // Rate limiting
      await wait(500);

      const [, info] = await saveContractFilesToFs(
        noopFse,
        network,
        address,
        EmptyLogger
      );

      this.logger.log("Saving name for", address, network, info.ContractName);

      await this.codeRepository
        .setByAddress(address, network, `name`, info.ContractName)
        .catch((e) => logger.error(e));
      return info.ContractName;
    }
    return undefined;
  }

  async generateDiffBetween(
    network: ApiName,
    proxyAddress: string,
    currentImplementation: string,
    previousImplementation: string,
    basePath: string,
    res: (diff: string) => void
  ) {
    this.logger.log(
      `--Diffing between ${currentImplementation} and ${previousImplementation}`
    );
    const oldPath = path.join(
      this.config.file.temp_path,
      "downloaded",
      basePath,
      "old"
    );
    const newPath = path.join(
      this.config.file.temp_path,
      "downloaded",
      basePath,
      "new"
    );
    const logger = this.logger;

    // Rate limiting
    await wait(500);
    const isPreviousVerified = await this.fetchSourceCode(
      network,
      oldPath,
      previousImplementation
    ).catch((e) => {
      logger.error(
        `Error when fetching previous impl:${previousImplementation} source code for proxy: ${proxyAddress}`,
        e.stack
      );
      return DEFAULT_ERROR_RESPONSE;
    });

    // Rate limiting
    await wait(500);

    //Always fetch current source code, so that reasons for unavailability can be more accurate
    const isCurrentVerified = await this.fetchSourceCode(
      network,
      newPath,
      currentImplementation
    ).catch((e) => {
      logger.error(
        `Error when fetching current impl:${previousImplementation} source code for proxy: ${proxyAddress}`,
        e.stack
      );
      return DEFAULT_ERROR_RESPONSE;
    });

    // Rate limiting
    await wait(500);
    if (!isCurrentVerified || !isPreviousVerified) {
      await Promise.reject(
        `Current implementation ${currentImplementation} is not verified for proxy: ${proxyAddress}`
      );
    }

    const diffPath = path.join(
      "diffs",
      `${this.beSettings.name}_${basePath}_diff.patch`
    );
    const absolutePath = path.join(this.config.file.temp_path, diffPath);

    mkdir(path.join(this.config.file.temp_path, `diffs`), { recursive: true });

    await diff(oldPath, newPath, absolutePath);

    // Make sure diff was ok
    await wait(1000);
    const file = fse.readFileSync(absolutePath);
    const fileContent = file.toString();
    if (fileContent.length !== 0) {
      res(fileContent);
    } else {
      await Promise.reject("File diff is empty");
    }
  }

  async generateDiffForUpgrade(
    network: ApiName,
    proxyAddress: string,
    currentImplementation: string,
    previousImplementation: string,
    blockNumber: number,
    tx_index: number,
    log_index: number
  ): Promise<string | undefined> {
    this.logger.log(
      "Previous and current impl",
      previousImplementation,
      currentImplementation
    );
    this.logger.log(`Generating diff for ${proxyAddress} at ${blockNumber}`);
    const basePath = `${blockNumber}_${tx_index}_${log_index}_${proxyAddress}`;
    const diffData = new Promise<string>(
      ((res: (diff: string) => void, rej: (err: Error) => void) => {
        this.generateDiffBetween(
          network,
          proxyAddress,
          currentImplementation,
          previousImplementation,
          basePath,
          res
        ).catch((e) => {
          rej(e);
        });
      }).bind(this)
    );
    return diffData;
  }
}
