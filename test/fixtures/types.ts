import { Generated } from "kysely"

export interface Entities {
  id: Generated<number>
  nickname: string
  active: Generated<number>
}

export interface Groups {
  parentId: number
  memberId: number
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
}

export interface GroupRoles {
  parentId: number
  memberId: number
  role: string
}

export interface Database {
  entities: Entities
  groups: Groups
  groupRoles: GroupRoles
}