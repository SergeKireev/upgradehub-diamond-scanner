import express, {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import cors from "cors";
import path from "path";
import {
  ErrorResponse,
  OkResponse,
  Response,
  Status,
  STATUS_NOK,
  STATUS_OK,
} from "../lib/interfaces/response";
import { ApiName } from "ethereum-sources-downloader";
import { CodeRepository } from "../lib/service/repository/code/code_repository";
import { DiamondEvent } from "../lib/interfaces/block_data";
import { DiamondEventsRepository } from "../lib/service/repository/events/diamond_events_repository";
import { SimpleDiff } from "../lib/interfaces/simple_diff";
import { SimpleDiffRepository } from "../lib/service/repository/diff/simple_diff_repository";
import { UpgradesDisplayView } from "../lib/service/repository/diff/upgrades_view";
import { PostgresClient } from "../lib/io/db/postgres_client";
import { SqliteClient } from "../lib/io/db/sqlite_client";
import { Config } from "../config/config_handler";
import { VerifiedStatus } from "../lib/interfaces/code_source";

const conf = Config.load();

const app = express();

//@ts-ignore
app.use(cors());
//@ts-ignore
app.options("*", cors());

const allowCrossDomain = function (
  req: ExpressRequest,
  res: ExpressResponse,
  next: () => void
) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
};
app.use(allowCrossDomain);
app.use(express.json());

const staticPath = path.join(__dirname, "..", "..", "web");
app.use(express.static(staticPath));

const dbClient =
  conf.db.type === "postgres"
    ? new PostgresClient(conf.db)
    : new SqliteClient(conf.db);
const upgradesView = new UpgradesDisplayView(dbClient);
const diamondCutRepository = new DiamondEventsRepository(dbClient);
const simpleDiffsRepository = new SimpleDiffRepository(dbClient);
const sourceCodeRepository = new CodeRepository(dbClient);

const facetCutsFetch = async (
  proxy: string,
  network: ApiName
): Promise<Response> => {
  const diamondEvents: DiamondEvent[] | undefined = await diamondCutRepository
    .fetchDiamondCutEventsForAddress(proxy, network)
    .catch(() => undefined);
  if (diamondEvents)
    return {
      status: STATUS_OK as Status,
      data: diamondEvents,
    } as OkResponse<DiamondEvent[]>;
  else {
    return {
      status: STATUS_NOK as Status,
      msg: "Could not fetch diamond events",
    } as ErrorResponse;
  }
};

const simpleDiffsFetch = async (
  proxy: string,
  network: ApiName
): Promise<Response> => {
  const simpleDiffs = await simpleDiffsRepository
    .fetchByProxy(proxy, network)
    .catch(() => undefined);
  if (simpleDiffs) {
    const response: OkResponse<SimpleDiff[]> = {
      status: STATUS_OK,
      data: simpleDiffs || [],
    };
    return response;
  } else {
    return {
      status: STATUS_NOK,
      msg: "Could not fetch simple diffs",
    } as ErrorResponse;
  }
};

const handleVerifiedImpls = async (proxy: string, network: ApiName) => {
  try {
    //1. FETCH UNION of current_impls and previous_impls
    const addresses = await upgradesView.fetchImplAddresses(
      proxy.toLowerCase(),
      network.toLowerCase() as ApiName
    );

    //2. FETCH verified status for all of them
    const response = await sourceCodeRepository.fetchVerifiedStatus(
      addresses,
      network as ApiName
    );
    const okResponse: OkResponse<VerifiedStatus[]> = {
      status: "ok",
      data: response || [],
    };
    return okResponse;
  } catch (e) {
    const errorResponse: ErrorResponse = {
      status: "nok",
      msg: "Could not fetch verified status",
    };
    return errorResponse;
  }
};

app.post(
  "/v2/facet_cuts",
  async (req: ExpressRequest, res: ExpressResponse) => {
    const proxy = req.body.address as string;
    const network = req.body.network as string;

    //Call on version 2
    const response = await facetCutsFetch(proxy, network as ApiName);
    res.send(response);
  }
);

app.post(
  "/v2/simple_diffs",
  async (req: ExpressRequest, res: ExpressResponse) => {
    const proxy = req.body.address as string;
    const network = req.body.network as string;

    //Call on version 2
    const response = await simpleDiffsFetch(proxy, network as ApiName);
    res.send(response);
  }
);

app.post(
  "/v2/verified_impls",
  async (req: ExpressRequest, res: ExpressResponse) => {
    const proxy = req.body.address as string;
    const network = req.body.network as string;
    const response = await handleVerifiedImpls(proxy, network as ApiName);
    res.send(response);
  }
);

app.get("/*", async (req: ExpressRequest, res: ExpressResponse) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

async function launch() {
  await diamondCutRepository.init();
  await simpleDiffsRepository.init();
  await sourceCodeRepository.init();
  const port = conf.app?.port || 3000;
  app.listen(port, () =>
    console.log(`App listening on locahost:${port}`)
  );
}
launch();
