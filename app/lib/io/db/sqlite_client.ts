import { DbResult, DbClient, DbValue } from "./dbclient";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { SqliteConfig } from "../../../config/config_handler";
import fse from "fs-extra";
import path from "path";

// this is a top-level await

export class SqliteClient implements DbClient {
  private db?: Database;
  private config: SqliteConfig;
  constructor(config: SqliteConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    // open the database
    if (!this.db) {
      if (this.config.path)
        await fse.mkdir(this.config.path, { recursive: true });
      const _path = this.config.path || "/tmp";
      const filename = path.join(_path, "upgradehub.db");
      this.db = await open({
        filename: filename,
        driver: sqlite3.Database,
      });
    }
  }

  async executeQuery<T>(query: string, args?: DbValue[]): Promise<DbResult<T>> {
    let rows = [];
    if (this.db) {
      if (args) {
        rows = await this.db.all(query, args);
      } else {
        rows = await this.db.all(query);
      }
    } else {
      return Promise.reject("Database not initialized");
    }
    return {
      rows: rows,
    };
  }
}
