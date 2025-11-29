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

export class MariadbDialect implements Dialect {
  readonly #config: MariadbDialectConfig

  constructor(config: MariadbDialectConfig) {
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

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new MysqlIntrospector(db)
  }
}