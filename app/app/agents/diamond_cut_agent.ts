import { ApiName } from "ethereum-sources-downloader";
import { ethers } from "ethers";
import path from "path";
import { AppConfig } from "../../config/config_handler";
import { DiamondEvent, EventData } from "../../lib/interfaces/block_data";
import { DiamondCutWithTxAndDiffImmunefi } from "../../lib/interfaces/diamond_cut";
import { SimpleDiff } from "../../lib/interfaces/simple_diff";
import {
  DIAMOND_CUT_TOPIC,
  DIAMOND_CUT_TOPIC_FREEZE,
} from "../../lib/interfaces/slots";
import { WithTxData } from "../../lib/interfaces/tx";
import { Logger } from "../../lib/io/log/Logger";
import { BlockexplorerSettings } from "../../lib/networks/network";
import { ContractCodeService } from "../../lib/service/block_explorer/contract_code_service";
import { FacetNameHandler } from "../../lib/service/block_explorer/facet_name_handler";
import { SimpleDiffRepository } from "../../lib/service/repository/diff/simple_diff_repository";
import { DiamondEventsRepository } from "../../lib/service/repository/events/diamond_events_repository";
import { FunctionSigDecorator } from "../decorator/function_sig_decorator";
import { EventDataAgent } from "./agent";

interface FacetCut {
  address: string;
  action: number;
  freezable?: number;
  selectors: string[];
}

export interface FacetCutSelectorAction {
  action: number;
  address: string;
}

const ACTION_ADD = 0;
const ACTION_REPLACE = 1;
const ACTION_REMOVE = 2;

const ACTION_TABLE = {
  [ACTION_ADD]: "Add",
  [ACTION_REPLACE]: "Replace",
  [ACTION_REMOVE]: "Remove",
};

export class DiamondCutAgent extends EventDataAgent<DiamondCutWithTxAndDiffImmunefi> {
  config: AppConfig;
  network: ApiName;
  selectorDecorator: FunctionSigDecorator;
  diamondEventsRepository: DiamondEventsRepository;
  blockExplorerSettings: BlockexplorerSettings;
  logger: Logger;
  contractCodeService: ContractCodeService;
  facetNameHandler: FacetNameHandler;

  simpleDiffRepository: SimpleDiffRepository;
  previousAddressBySelector: { [selector: string]: string } = {};

  constructor(
    config: AppConfig,
    network: ApiName,
    blockExplorerSettings: BlockexplorerSettings,
    selectorDecorator: FunctionSigDecorator,
    diamondEventsRepository: DiamondEventsRepository,
    simpleDiffRepository: SimpleDiffRepository,
    contractCodeService: ContractCodeService,
    facetNameHandler: FacetNameHandler
  ) {
    super();
    this.config = config;
    this.blockExplorerSettings = blockExplorerSettings;
    this.network = network;
    this.selectorDecorator = selectorDecorator;
    this.diamondEventsRepository = diamondEventsRepository;
    this.simpleDiffRepository = simpleDiffRepository;
    this.logger = new Logger(this.network);
    this.contractCodeService = contractCodeService;
    this.facetNameHandler = facetNameHandler;
  }

  fetchSignature(selector: string) {
    return this.selectorDecorator.decorate(selector);
  }

  parseDiamondCutData(blockData: EventData): FacetCut[] {
    const abiCoder = new ethers.utils.AbiCoder();
    let diamondCuts = [];
    //Format used by zksyncera
    if (blockData.topics[0] === DIAMOND_CUT_TOPIC_FREEZE) {
      const diamondCutData = abiCoder.decode(
        ["tuple(address,uint8,uint8,bytes4[])[]", "address", "bytes"],
        blockData.data
      );
      diamondCuts = diamondCutData[0].map((x) => {
        return {
          address: x[0],
          action: x[1],
          freezable: x[2],
          selectors: x[3],
        };
      });
    } else if (blockData.topics[0] === DIAMOND_CUT_TOPIC) {
      const diamondCutData = abiCoder.decode(
        ["tuple(address,uint8,bytes4[])[]", "address", "bytes"],
        blockData.data
      );
      if (diamondCutData[0].length === 0) {
        this.logger.log(
          "Empty facet cuts",
          diamondCutData[1],
          diamondCutData[2]
        );
      }
      diamondCuts = diamondCutData[0].map((x) => {
        return {
          address: x[0],
          action: x[1],
          selectors: x[2],
        };
      });
    }

    //We don't care about data initialization for now
    return diamondCuts;
  }

  private async createDiff(
    proxyAddress: string,
    currentImpl: string,
    previousImpl: string,
    network: ApiName
  ) {
    const basePath = `${network}_${previousImpl}_${currentImpl}`;
    const found: SimpleDiff[] = await this.simpleDiffRepository.fetch(
      currentImpl,
      previousImpl,
      network
    );
    if (found.length === 0) {
      this.logger.log("Creating code diff", basePath);
      const diffData = await new Promise<string>(
        ((res: (diff: string) => void, rej: (err: Error) => void) => {
          this.contractCodeService
            .generateDiffBetween(
              network,
              proxyAddress,
              currentImpl,
              previousImpl,
              basePath,
              res
            )
            .catch((e) => {
              rej(e);
            });
        }).bind(this)
      );
      if (diffData) {
        this.logger.log("Successfully computed diff", basePath);
        await this.simpleDiffRepository.save({
          proxy_impl: proxyAddress,
          current_impl: currentImpl,
          diff: diffData,
          network: network,
          previous_impl: previousImpl,
        });
      }
    } else {
      const foundForProxy = found.find((x) => x.proxy_impl === proxyAddress);
      if (foundForProxy === undefined) {
        this.logger.log(
          "Code diff already exists, but not on this proxy",
          basePath
        );
        await this.simpleDiffRepository.save({
          ...found[0],
          proxy_impl: proxyAddress,
        });
      } else {
        this.logger.log("Code diff already exists", basePath);
      }
    }
  }

  private async handleAddresses(facetCuts: FacetCut[]) {
    const facetCutsLen = facetCuts.length;
    let i = 0;
    while (i < facetCutsLen) {
      const address = facetCuts[i].address;
      await this.facetNameHandler
        .handle(address, this.network)
        .catch(() => undefined);
      i++;
    }
  }

  private async upsertEvent(
    facetCut: FacetCut,
    blockData: EventData,
    txData: WithTxData,
    selector: string
  ) {
    const functionSig = await this.selectorDecorator.decoratev2(selector);
    const diamondEvent: DiamondEvent = {
      ...txData,
      action: facetCut.action,
      address: blockData.address.toLowerCase(),
      network: this.network,
      new_impl: facetCut.address.toLowerCase(),
      selector: selector,
      function_sig: functionSig,
    };
    this.logger.log(
      "Saving selector action:",
      diamondEvent.function_sig,
      ACTION_TABLE[diamondEvent.action],
      diamondEvent.new_impl
    );
    await this.diamondEventsRepository.save(diamondEvent);
  }

  async processEvents(
    blockData: EventData,
    facetCuts: FacetCut[],
    txData: WithTxData
  ) {
    const events = await this.diamondEventsRepository.fetchDiamondCutEvents(
      blockData.address.toLowerCase(),
      this.network,
      txData.tx_hash,
      txData.log_index
    );
    this.logger.log("Processing events");
    if ((events?.length || 0) > 0) {
      this.logger.log(
        "Already found events for ",
        blockData.address.toLowerCase(),
        this.network,
        txData.tx_hash,
        txData.log_index
      );
      return;
    }
    const facetCutsLen = facetCuts.length;
    let i = 0,
      j = 0;

    try {
      while (i < facetCutsLen) {
        const facetCut = facetCuts[i];
        const selectorsLen = facetCut.selectors.length;
        j = 0;
        while (j < selectorsLen) {
          const selector = facetCut.selectors[j];

          const logger = this.logger;
          await this.upsertEvent(facetCut, blockData, txData, selector).catch(
            (e) => logger.error("Failed to save facet cut event", e)
          );
          const previousAddress = this.previousAddressBySelector[selector];

          if (facetCut.action != ACTION_REMOVE)
            this.previousAddressBySelector[selector] =
              facetCut.address.toLowerCase();

          if (previousAddress && facetCut.action != ACTION_REMOVE) {
            if (
              previousAddress.toLowerCase() === facetCut.address.toLowerCase()
            ) {
              this.logger.log(
                `Previous address is same as target: ${previousAddress}, nothing to do`
              );
            } else {
              await this.createDiff(
                blockData.address.toLowerCase(),
                facetCut.address.toLowerCase(),
                previousAddress.toLowerCase(),
                this.network
              ).catch(() => undefined);
            }
          } else if (!previousAddress) {
            this.logger.log(
              "First event for selector",
              selector,
              "fetching implementation"
            );
            const basePath = `${txData.block_number}_${txData.tx_index}_${txData.log_index}_${blockData.address}`;
            const _path = path.join(
              this.config.file.temp_path,
              "downloaded",
              basePath,
              "first"
            );
            await this.contractCodeService.fetchSourceCode(
              this.network,
              _path,
              facetCut.address.toLowerCase()
            );
          }
          j++;
        }
        i++;
      }
    } catch (e) {
      this.logger.error("Failed!!", e);
    }
  }

  async callback(blockData: EventData): Promise<void> {
    const facetCuts = this.parseDiamondCutData(blockData);
    const txData = this.parseTxData(blockData);
    // this.processFacetCuts(facetCuts);
    await this.processEvents(blockData, facetCuts, txData);

    // Cache facet names
    await this.handleAddresses(facetCuts);
  }
}
