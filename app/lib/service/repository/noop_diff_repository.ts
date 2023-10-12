import { IRepository } from "./irepository";

export class NoopRepository<T> implements IRepository<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  set<V>(id: number, key: string, value: V): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async save(u: T) {
    console.log("[Repository] Saving upgrade", JSON.stringify(u));
    return 0;
  }
}
