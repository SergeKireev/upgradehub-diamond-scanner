import { ApiName } from "ethereum-sources-downloader";
import { AppConfig } from "../../../config/config_handler";
import { EventData } from "../../../lib/interfaces/block_data";
import { DiamondCutWithTxAndDiffImmunefi } from "../../../lib/interfaces/diamond_cut";
import { Logger } from "../../../lib/io/log/Logger";
import { getBlockExplorerSettings } from "../../../lib/networks/network";
import { ContractCodeService } from "../../../lib/service/block_explorer/contract_code_service";
import { FacetNameHandler } from "../../../lib/service/block_explorer/facet_name_handler";
import { CodeRepository } from "../../../lib/service/repository/code/code_repository";
import { SimpleDiffRepository } from "../../../lib/service/repository/diff/simple_diff_repository";
import { DiamondEventsRepository } from "../../../lib/service/repository/events/diamond_events_repository";
import { FunctionSigDecorator } from "../../decorator/function_sig_decorator";
import { DiamondCutAgent } from "../diamond_cut_agent";
import { IAgentFactory } from "./iagent_factory";

interface EventDataAgentProps {
  network: ApiName;
  appConfig: AppConfig;
  diamondEventsRepository: DiamondEventsRepository;
  diffRepository: SimpleDiffRepository;
  codeRepository: CodeRepository;
}

export class DiamondAgentFactory
  implements
    IAgentFactory<
      EventDataAgentProps,
      EventData,
      DiamondCutWithTxAndDiffImmunefi
    >
{
  async create(props: EventDataAgentProps): Promise<DiamondCutAgent> {
    const { network } = props;
    await props.diffRepository.init();

    //TODO: get a new set of keys for this one
    const blockExplorerSettings = getBlockExplorerSettings(network, undefined);

    const functionSigDecorator = new FunctionSigDecorator();
    const contractCodeService = new ContractCodeService(
      props.appConfig,
      blockExplorerSettings,
      props.codeRepository,
      new Logger(blockExplorerSettings.name)
    );

    const facetNameHandler = new FacetNameHandler(contractCodeService);

    const eventAgent = new DiamondCutAgent(
      props.appConfig,
      network,
      blockExplorerSettings,
      functionSigDecorator,
      props.diamondEventsRepository,
      props.diffRepository,
      contractCodeService,
      facetNameHandler
    );
    return eventAgent;
  }
}
