import { ApiName } from "ethereum-sources-downloader";
import { Agent } from "../agents/agent";

export interface Provider<E, T> {
  networks: ApiName[];
  attach(agent: Agent<E, T>): void;
}
