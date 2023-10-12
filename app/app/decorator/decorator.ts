export interface Decorator<T> {
  init(): void;
  decorate(address: string): Promise<T>;
}
