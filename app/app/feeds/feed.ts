export interface Feed<T> {
  post(t: T): Promise<void>;
}

export class NoopFeed<T> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async post(t: T) {}
}
