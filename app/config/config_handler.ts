import YAML from "yaml";
import fse from "fs-extra";
import path from "path";
import { ApiName } from "ethereum-sources-downloader";
import dotenv from "dotenv";

dotenv.config();

export interface PostgresConfig {
  type: "postgres";
  user: string;
  host: string;
  port: number;
  database: string;
  sslmode: string;
  certpath?: string;
  certificate?: string;
  password?: string;
}

export interface SqliteConfig {
  type: "sqlite";
  path?: string;
}

export interface AppConfig {
  db: PostgresConfig | SqliteConfig;
  app: {
    port: number;
  };
  scan: {
    address: string;
    network: ApiName;
  };
  file: {
    temp_path: string;
  };
}

export class Config {
  static load(): AppConfig {
    console.log("Loading config");
    const configPath = path.join(__dirname, "..", "..", "config.yml");
    const configYaml = fse.readFileSync(configPath, "utf-8");
    const _config: AppConfig = YAML.parse(configYaml) || {};

    if (_config?.db?.type === "postgres") {
      console.log("Using Postgres database");
      _config.db.password = process.env.POSTGRES_PASSWORD;
      if (_config?.db?.certpath) {
        const certpath = path.join(__dirname, "..", "..", _config.db.certpath);
        const certificate = fse.readFileSync(certpath).toString();
        _config.db.certificate = certificate;
        delete _config.db.certpath;
      }
    } else {
      console.log("Using SQLite database");
    }
    return _config;
  }
}
