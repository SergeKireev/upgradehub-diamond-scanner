import { ApiName } from "ethereum-sources-downloader/src/explorer";

export class Logger {
  scope: string;
  constructor(scope: ApiName | "general") {
    this.scope = scope;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(...args: any) {
    console.log(`[${this.scope}] [LOG]`, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...args: any) {
    console.log(`[${this.scope}] [ERROR]`, ...args);
  }
}
