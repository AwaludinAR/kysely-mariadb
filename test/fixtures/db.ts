import { CamelCasePlugin, Kysely } from "kysely"
import { isBun } from 'std-env'
import { MariadbDialect } from '../../src'
import { Database } from "./types"
import { MariadbPool, MariadbSQL } from "../../src/types"

export async function useDB(options: { host?: string, port?: number, user?: string, password?: string } = {}) {

  const { host, port, user, password } = options
  let poolOrSql: MariadbPool | MariadbSQL
  if (isBun) {
    const { SQL } = await import('bun')
    poolOrSql = new SQL(
      {
        adapter: 'mariadb',
        hostname: host || 'localhost',
        port: port || 3306,
        username: user || 'root',
        password: password || 'root',
        database: 'test',
      }
    )
  } else {
    const { createPool } = await import('mariadb')
    poolOrSql = createPool({
      host: host || 'localhost',
      port: port || 3306,
      user: user || 'root',
      password: password || 'root',
      database: 'test',
    })
  }

  return new Kysely<Database>({
    dialect: new MariadbDialect({ mariadb: poolOrSql }),
    plugins: [new CamelCasePlugin()]
  })
}