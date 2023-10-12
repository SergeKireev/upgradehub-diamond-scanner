import path from "path";
import { Logger } from "../../io/log/Logger";
import fse from "fs-extra";
import { prettier } from "prettier";

type Entry = string[];

export function writeToDisk(logger: Logger, entries: Entry[], outDir?: string) {
  for (const [_filePath, content] of entries) {
    const filePath = path.join(outDir || "out", _filePath);
    const _content = content.replace(/\r/g, "");

    let __content = _content;
    try {
      __content = prettier.format(_content, {
        parser: "solidity-parse",
        plugins: [require("prettier-plugin-solidity")],
      });
    } catch (e) {
      logger.log("Failed to prettify", e);
      __content = _content;
    }

    fse.outputFile(filePath, __content, (err) => {
      if (err) {
        logger.log("Error writing file", err);
      } else {
        logger.log("Written", filePath);
      }
    });
  }
}
