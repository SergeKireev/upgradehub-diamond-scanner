import { Agent } from "../agent";

export interface IAgentFactory<T, R, S> {
  create(props: T): Promise<Agent<R, S>>;
}
