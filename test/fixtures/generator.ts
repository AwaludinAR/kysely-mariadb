import { Kysely, sql } from "kysely";
import { Database } from "./types";

export async function generateTable(db: Kysely<Database>) {
  await clearTable(db)

  // Entity table
  await db.schema.createTable('entities')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('nickname', 'varchar(20)', (col) => col.unique().notNull())
    .addColumn('active', 'boolean', (col) => col.defaultTo(true).notNull())
    .execute()

  // Group table
  await db.schema.createTable('groups')
    .addColumn('parent_id', 'integer', (col) => col.notNull())
    .addColumn('member_id', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint('primary_key', ['parent_id', 'member_id'])
    .addForeignKeyConstraint('groups_parent_id_fk', ['parent_id'], 'entities', ['id'])
    .addForeignKeyConstraint('groups_member_id_fk', ['member_id'], 'entities', ['id'])
    .execute()

  // Group role table
  await db.schema.createTable('group_roles')
    .addColumn('parent_id', 'integer', (col) => col.notNull())
    .addColumn('member_id', 'integer', (col) => col.notNull())
    .addColumn('role', 'varchar(50)', (col) => col.notNull())
    .addPrimaryKeyConstraint('primary_key', ['parent_id', 'member_id', 'role'])
    .addForeignKeyConstraint('group_roles_parent_id_fk', ['parent_id'], 'entities', ['id'])
    .addForeignKeyConstraint('group_roles_member_id_fk', ['member_id'], 'entities', ['id'])
    .execute()
}

export async function clearTable(db: Kysely<Database>) {
  await db.schema.dropTable('group_roles').ifExists().execute()
  await db.schema.dropTable('groups').ifExists().execute()
  await db.schema.dropTable('entities').ifExists().execute()
}