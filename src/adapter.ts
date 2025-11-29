import { MysqlAdapter } from "kysely";

export class MariadbAdapter extends MysqlAdapter {
  /**
   * - DELETE... RETURNING: Supported since MariaDB 10.0.
   * - INSERT... RETURNING: Supported since MariaDB 10.5.
   * - REPLACE... RETURNING: Supported since MariaDB 10.5.
   */
  override get supportsReturning(): boolean {
    return true
  }
}