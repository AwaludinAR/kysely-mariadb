import {
  CompiledQuery,
  DatabaseConnection,
  MysqlDriver,
  QueryResult,
} from "kysely";
import {
  MariadbDialectConfig,
  MariadbPool,
  MariadbPoolConnection,
  MariadbReservedSQL,
  MariadbSQL,
} from "./types";
import { isPool, isPoolConnection } from "./utils";

const PRIVATE_RELEASE_METHOD: unique symbol = Symbol()

export class MariadbDriver extends MysqlDriver {
  readonly #config: MariadbDialectConfig
  #mariadb?: MariadbPool | MariadbSQL

  constructor(config: MariadbDialectConfig) {
    super({} as never)
    this.#config = config
  }

  override async init(): Promise<void> {
    const { mariadb } = this.#config

    if (typeof mariadb === 'function' && !('reserve' in mariadb)) {
      this.#mariadb = await mariadb()
      return
    }
    this.#mariadb = mariadb
  }

  override async destroy(): Promise<void> {
    await this.#mariadb?.end()
  }

  override async acquireConnection(): Promise<DatabaseConnection> {
    if (!this.#mariadb) {
      throw new Error('MariadbDriver has not been initialized. Ensure init() is called before acquiring connections.')
    }
    const rawConnection = isPool(this.#mariadb)
      ? await this.#mariadb.getConnection()
      : await this.#mariadb.reserve()
    return new MariadbConnection(rawConnection)
  }

  override async releaseConnection(connection: DatabaseConnection): Promise<void> {
    await (connection as MariadbConnection)[PRIVATE_RELEASE_METHOD]()
  }
}

export class MariadbConnection implements DatabaseConnection {
  readonly #rawConnection: MariadbPoolConnection | MariadbReservedSQL

  constructor(rawConnection: MariadbPoolConnection | MariadbReservedSQL) {
    this.#rawConnection = rawConnection
  }

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    const { sql, parameters } = compiledQuery

    const result = isPoolConnection(this.#rawConnection)
      ? await this.#rawConnection.query(sql, parameters as any)
      : await this.#rawConnection.unsafe(sql, parameters as any)


    let affectedRows: bigint | undefined = undefined
    let insertId: bigint | undefined = undefined
    if ('affectedRows' in result) {
      affectedRows = BigInt(result.affectedRows)
    }
    if ('insertId' in result) {
      insertId = BigInt(result.insertId)
    }
    if ('lastInsertRowid' in result) {
      insertId = BigInt(result.lastInsertRowid as number)
    }

    return {
      insertId,
      numAffectedRows: affectedRows,
      rows: Array.isArray(result) ? result : []
    }
  }

  async *streamQuery<O>(compiledQuery: CompiledQuery, chunkSize: number): AsyncIterableIterator<QueryResult<O>> {
    if (!isPoolConnection(this.#rawConnection)) {
      throw new Error('MariadbDialect detected the instance you passed to it does not support streaming.')
    }
    if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
      throw new Error('chunkSize must be a positive integer')
    }

    const { parameters, sql } = compiledQuery
    const stream = this.#rawConnection.queryStream(sql, parameters as any)
    const buffer: O[] = [];

    try {
      for await (const row of stream) {
        buffer.push(row)
        if (buffer.length >= chunkSize) {
          yield { rows: buffer }
          buffer.length = 0
        }
      }

      if (buffer.length > 0) {
        yield { rows: buffer }
      }
    } finally {
      stream.destroy()
    }
  }

  async [PRIVATE_RELEASE_METHOD](): Promise<void> {
    await this.#rawConnection.release()
  }
}