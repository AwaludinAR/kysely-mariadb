import { MariadbPool, MariadbPoolConnection } from "./types";

export function isPool(mariadb: unknown): mariadb is MariadbPool {
  return !!mariadb && typeof mariadb === 'object' && 'getConnection' in mariadb
}

export function isPoolConnection(connection: unknown): connection is MariadbPoolConnection {
  return !!connection && typeof connection === 'object' && 'query' in connection
}