import {
  DatabaseIntrospector,
  Dialect,
  DialectAdapter,
  Driver,
  Kysely,
  MysqlIntrospector,
  MysqlQueryCompiler,
  QueryCompiler
} from "kysely";
import { MariadbDialectConfig } from "./types";
import { MariadbDriver } from "./driver";
import { MariadbAdapter } from "./adapter";

/**
 * MariaDB dialect for Kysely.
 *
 * Supports both Node.js (via `mariadb` npm package pool) and Bun (via Bun's built-in `SQL` API).
 *
 * @example
 * ```ts
 * import { Kysely } from 'kysely'
 * import { createPool } from 'mariadb'
 * import { MariadbDialect } from 'kysely-mariadb'
 *
 * const pool = createPool('mariadb://root@localhost:3306/myDatabase')
 * const db = new Kysely<Database>({
 *   dialect: new MariadbDialect({ mariadb: pool }),
 * })
 * ```
 */
export class MariadbDialect implements Dialect {
  readonly #config: MariadbDialectConfig

  constructor(config: MariadbDialectConfig) {
    if (!config?.mariadb) {
      throw new Error('MariadbDialectConfig.mariadb is required. Pass a MariaDB pool, Bun SQL instance, or a factory function.')
    }
    this.#config = config
  }

  createDriver(): Driver {
    return new MariadbDriver(this.#config)
  }

  createQueryCompiler(): QueryCompiler {
    return new MysqlQueryCompiler()
  }

  createAdapter(): DialectAdapter {
    return new MariadbAdapter()
  }

  createIntrospector(db: Kysely<unknown>): DatabaseIntrospector {
    return new MysqlIntrospector(db)
  }
}