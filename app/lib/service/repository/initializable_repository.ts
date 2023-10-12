import { DbClient } from "../../io/db/dbclient";
import { IRepository } from "./irepository";

export abstract class InitializableRepository<T> implements IRepository<T> {
  abstract save(t: T): Promise<number>;
  abstract set<V>(id: number, key: string, value: V): Promise<void>;
  protected abstract dbClient: DbClient;

  async init() {
    await this.dbClient.initialize();
  }
}
