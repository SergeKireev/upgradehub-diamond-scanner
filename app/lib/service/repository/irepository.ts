export interface IRepository<T> {
  save(t: T): Promise<number>;
  set<V>(id: number, key: string, value: V): Promise<void>;
  init?(): Promise<void>;
}
