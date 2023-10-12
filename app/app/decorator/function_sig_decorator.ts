import { Logger } from "../../lib/io/log/Logger";
import { wait } from "../../lib/utils/wait";

interface FunctionSignature {
  name: string;
  filterered: boolean;
}

interface FunctionSigDecoratorResult {
  function: {
    [selector: string]: FunctionSignature[];
  };
}

interface FunctionSigDecoratorResponse {
  ok: boolean;
  result: FunctionSigDecoratorResult;
}

export class FunctionSigDecorator {
  logger: Logger;
  functionSigCache: { [selector: string]: string } = {};

  constructor() {
    this.logger = new Logger("general");
  }

  async decorate(selector: string): Promise<string | undefined> {
    try {
      if (this.functionSigCache[selector]) {
        return this.functionSigCache[selector];
      }

      const response = await fetch(
        `https://sig.eth.samczsun.com/api/v1/signatures?function=${selector}`
      );
      const jsonResponse: FunctionSigDecoratorResponse = await response.json();
      if (jsonResponse.ok) {
        const name =
          jsonResponse.result.function[selector] &&
          jsonResponse.result.function[selector][0]?.name;
        this.functionSigCache[selector] = name;
        return name;
      } else {
        this.logger.log(
          "Error fetching signature for selector",
          selector,
          jsonResponse
        );
        return undefined;
      }
    } catch (e) {
      this.logger.error("Error fetching signature for selector", selector, e);
      return undefined;
    }
  }

  async decoratev2(selector: string): Promise<string | undefined> {
    try {
      if (this.functionSigCache[selector]) {
        this.logger.log(
          "Found selector name in cache",
          this.functionSigCache[selector]
        );
        return this.functionSigCache[selector];
      }

      console.log("Not found selector name in cache", selector);
      // Rate limiting, even though openchain api does not rate limit
      await wait(100);

      const response = await fetch(
        `https://api.openchain.xyz/signature-database/v1/lookup?filter=false&function=${selector}`
      );
      const jsonResponse: FunctionSigDecoratorResponse = await response.json();
      if (jsonResponse.ok) {
        const name =
          jsonResponse.result.function[selector] &&
          jsonResponse.result.function[selector][0]?.name;
        this.functionSigCache[selector] = name;
        return name;
      } else {
        this.logger.log(
          "Error fetching signature for selector",
          selector,
          jsonResponse
        );
        return undefined;
      }
    } catch (e) {
      this.logger.error("Error fetching signature for selector", selector, e);
      return undefined;
    }
  }
}
