# Upgradehub Diamond Scanner

## Setup
run:
`npm i && tsc`

## Standalone `DiamondCut` scanner

run using:
`node build/app/app/diamond_scan_process.js`

(See `Scan Configuration` section)

## Web api server for upgradehub-frontend

run using:
`node build/app/app/website.js`

(See `App Configuration` section)

## Using Docker

`docker build -t diamond-scanner -f docker/Dockerfile .`
`docker run -itd diamond-scanner`

# Configuration
## Dot env
If postgresql is used as a database, provide password for postgres as indicated below, in `.env` file at the root of the project

```
POSTGRES_PASSWORD=
```

## DB Configuration (Postgres)

| Key       | Value                  | Description                                       |
|-----------|------------------------|---------------------------------------------------|
| type      | postgres               | Use a postgres database                           |
| certpath  | postgresql.cert        | Path to certificate                               |
| user      | myuser                 | Username used in credentials                      |
| host      | upgradehub-data.com    | Host                                              |
| port      | 25060                  | Port                                              |
| database  | defaultdb              | Database name                                     |
| sslmode   | require                | Use sslmode                                       |

## DB Configuration (Sqlite)

| Key       | Value          | Description                                                           |
|-----------|----------------|-----------------------------------------------------------------------|
| type      | sqlite         | Use a sqlite local database                                           |
| path      | /tmp           | Directory where the local database will be stored (`/tmp` by default) |

## Scan Configuration

Configuration used to launch a scan for processing `DiamondCut` events

| Key      | Value                                             |
|----------|---------------------------------------------------|
| address  | 0x32400084c286cf3e17e7b677ea9583e60a000324      |
| network  | etherscan                                       |

## File configuration

Configuration used for temporary files created during diff processing

| Key      | Value       | Description                                      |
|----------|-------------|--------------------------------------------------|
| temp_path| /tmp        | Directory where temporary files are stored       |

## App configuration

Configuration used for temporary files created during diff processing

| Key      | Value       | Description                                      |
|----------|-------------|--------------------------------------------------|
| port     | 3000        | Port the web api server listens on        |