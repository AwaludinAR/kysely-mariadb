import { Readable } from 'node:stream'

export interface MariadbDialectConfig {
  mariadb: Mariadb
}

export type Mariadb =
  | MariadbPool
  | MariadbSQL
  | (() => MariadbPool | MariadbSQL | Promise<MariadbPool> | Promise<MariadbSQL>)

export interface MariadbPool {
  getConnection: () => Promise<MariadbPoolConnection>
  end: () => Promise<void>
}

export interface MariadbSQL {
  (sql: string, values?: any[]): Promise<any>
  reserve: () => Promise<MariadbReservedSQL>
  end: () => Promise<void>
}

export interface MariadbPoolConnection {
  release: () => Promise<void>
  query: (sql: string, parameters?: any[]) => Promise<MariadbPoolResult | Array<any>>
  queryStream: (sql: string, parameters?: any[]) => Readable
}

export interface MariadbReservedSQL {
  release: () => void
  unsafe: (query: string, parameters?: any[]) => Promise<MariadbSQLResult>
}

export interface MariadbSQLResult extends Array<any> {
  lastInsertRowid: number
  affectedRows: number
}

export interface MariadbPoolResult {
  insertId: number | bigint
  affectedRows: number
}