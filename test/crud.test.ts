import { afterAll, describe, expect, it } from 'vitest'
import { generateTable, useDB } from './fixtures'
import { isBun } from 'std-env'

describe('CRUD', async () => {
  const db = await useDB()
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
    const trx = await db.startTransaction().execute()
    it('Should execute update queries', async () => {
      const result = await trx.updateTable('entities').set({ active: 0 }).where('id', '=', 3).executeTakeFirst()
      expect(result.numUpdatedRows).toEqual(BigInt(1))
    })

    afterAll(async () => {
      await trx.rollback().execute()
    })
  })

  describe('Delete', () => {
    it('Should exeucte delete queries', async () => {
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