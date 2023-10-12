export interface DbResult<T> {
  rows: T[];
}

export type DbValue = string | number;

export interface DbClient {
  initialize(): Promise<void>;
  executeQuery<T>(query: string, args?: DbValue[]): Promise<DbResult<T>>;
}
