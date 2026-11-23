import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Database, generateTable, useDB } from './fixtures'
import { isBun } from 'std-env'
import { ControlledTransaction, Kysely, sql } from 'kysely'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

describe('CRUD', async () => {
  let db: Kysely<Database>

  beforeAll(async () => {
    db = await useDB()
  })

  afterAll(async () => {
    await db.destroy()
  })
  it('Should create tables', async () => {
    await expect(generateTable(db)).resolves.not.toThrow()
  })

  describe('Create', () => {
    it('Should execute insert and return insertId', async () => {
      const result = await db.insertInto('entities').values({ nickname: 'entity1' }).executeTakeFirst()
      expect(result).haveOwnProperty('numInsertedOrUpdatedRows')
      expect(result.insertId).toBeTypeOf('bigint')
    })

    it('Should execute insert and return array of insertId', async () => {
      const result = await db.insertInto('entities').values([{ nickname: 'entity2' }, { nickname: 'entity3' }]).execute()
      expect(result).toBeInstanceOf(Array)
      expect(result).toContainEqual({ insertId: 2n, numInsertedOrUpdatedRows: 2n })
    })

    it('Should execute insert and return all (returningAll)', async () => {
      const result = await db.insertInto('groups').values(
        [
          { parentId: 1, memberId: 2 },
          { parentId: 1, memberId: 3 }
        ]
      ).returningAll().executeTakeFirst()
      expect(result).not.toEqual(undefined)
      expect(result).haveOwnProperty('parentId', 1)
      expect(result).haveOwnProperty('memberId', 2)
    })

    it('Should not return insertId for tables without auto increment', async () => {
      const result = await db.insertInto('groups').values({ parentId: 2, memberId: 3 }).executeTakeFirst()
      expect(result.insertId).toBeUndefined()
      expect(result.numInsertedOrUpdatedRows).toEqual(1n)
    })

    it('Should execute insert and return selected (returning)', async () => {
      const result = await db.insertInto('groupRoles').values(
        [
          { parentId: 1, memberId: 2, role: 'ADMIN' },
          { parentId: 1, memberId: 3, role: 'USER' }
        ]
      ).returning(['parentId', 'memberId', 'role']).execute()
      expect(result).toBeInstanceOf(Array)
      expect(result).toContainEqual({ parentId: 1, memberId: 3, role: 'USER' })
    })
  })

  describe('Read', () => {
    it.skipIf(isBun)('Should support stream', async () => {
      const stream = db.selectFrom('entities').selectAll().stream()
      const results = []
      for await (const row of stream) {
        results.push(row)
      }

      expect(results).toContainEqual({ id: 3, nickname: 'entity3', active: 1 })
    })

    it.skipIf(isBun)('Should keep the connection usable after a stream is stopped early', async () => {
      // One connection, so the next query runs on the one the stream used.
      const singleConnectionDb = await useDB({ connectionLimit: 1 })
      try {
        const rows = []
        // Large enough that rows are still unread when the loop breaks.
        const stream = singleConnectionDb
          .selectFrom(sql<{ seq: number }>`seq_1_to_100000`.as('s'))
          .select('s.seq')
          .stream()
        for await (const row of stream) {
          rows.push(row)
          if (rows.length >= 10) break
        }
        expect(rows).toHaveLength(10)

        const result = await withTimeout(
          singleConnectionDb.selectNoFrom(sql<number>`1`.as('ok')).executeTakeFirst(),
          2000,
        )
        expect(result).toEqual({ ok: 1 })
      } finally {
        await withTimeout(singleConnectionDb.destroy(), 1000).catch(() => {})
      }
    })

    it('Should execute and pass select queries', async () => {
      const result = await db.selectFrom('groups')
        .innerJoin('entities', 'entities.id', 'groups.parentId')
        .where('groups.memberId', '=', 2)
        .selectAll('entities')
        .executeTakeFirst()
      expect(result).toEqual({ id: 1, nickname: 'entity1', active: 1 })
    })
  })

  describe('Update', async () => {
    let trx: ControlledTransaction<Database, []>

    beforeAll(async () => {
      trx = await db.startTransaction().execute()
    })

    afterAll(async () => {
      await trx.rollback().execute()
    })

    it('Should execute update queries', async () => {
      const result = await trx.updateTable('entities').set({ active: 0 }).where('id', '=', 3).executeTakeFirst()
      expect(result.numUpdatedRows).toEqual(BigInt(1))
    })
  })

  describe('Delete', () => {
    it('Should execute delete queries', async () => {
      const result = await db.deleteFrom('groupRoles').execute()
      expect(result).instanceOf(Array)
      expect(result[0]).toEqual({ numDeletedRows: 2n })
    })

    it('Should execute delete queries and return (returning)', async () => {
      const result = await db.deleteFrom('groups').returning(['parentId', 'memberId']).execute()
      expect(result).toBeInstanceOf(Array)
      expect(result).toContainEqual({ parentId: 1, memberId: 3 })
    })
  })
})
