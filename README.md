# Mariadb Dialect for Kysely

[![npm version][npm-version-src]][npm-version-href]
[![License][license-src]][license-href]
[![ci][ci-src]][ci-href]
[![pkg.pr.new](https://pkg.pr.new/badge/AwaludinAR/kysely-mariadb)](https://pkg.pr.new/~/AwaludinAR/kysely-mariadb)

## Installation

### Node.js

npm

```bash
npm install kysely-mariadb mariadb kysely
```

pnpm

```bash
pnpm add kysely-mariadb mariadb kysely
```

yarn

```bash
yarn add kysely-mariadb mariadb kysely
```

### Bun

```bash
bun add kysely-mariadb kysely
```

## Compatibility

| Dependency | Supported versions             |
| ---------- | ------------------------------ |
| Node.js    | 20 or later                    |
| Bun        | 1.2.22 or later                |
| `kysely`   | 0.28.17 or later, below 1.0    |
| `mariadb`  | 3.2.6+, 3.3.5+, 3.4.8+, 3.5.5+ |

Earlier patch releases of `kysely` and `mariadb` have known SQL injection vulnerabilities. CI runs the tests against both the lowest and the latest supported versions, on MariaDB Server 10, 11 and 12.

## Usage

### Node.js

```ts
import type { GeneratedAlways, Generated } from "kysely";
import { Kysely } from "kysely";
import { createPool } from "mariadb";
import { MariadbDialect } from "kysely-mariadb";

interface Database {
  users: {
    id: GeneratedAlways<number>;
    nickname: string;
    verified: Generated<number>;
  };
}

const pool = createPool("mariadb://root@localhost:3306/myDatabase");
const dialect = new MariadbDialect({ mariadb: pool });
const db = new Kysely<Database>({ dialect });

const user = await db
  .insertInto("users")
  .values({ nickname: "user1" })
  .returning("id")
  .executeTakeFirst();
console.log(user?.id);
```

### Bun

```ts
import type { GeneratedAlways, Generated } from "kysely";
import { Kysely } from "kysely";
import { SQL } from "bun";
import { MariadbDialect } from "kysely-mariadb";

interface Database {
  users: {
    id: GeneratedAlways<number>;
    nickname: string;
    verified: Generated<number>;
  };
}

const sql = new SQL("mariadb://root@localhost:3306/myDatabase");
const dialect = new MariadbDialect({ mariadb: sql });
const db = new Kysely<Database>({ dialect });

const user = await db
  .insertInto("users")
  .values({ nickname: "user1" })
  .returning("id")
  .executeTakeFirst();
console.log(user?.id);
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/kysely-mariadb/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/kysely-mariadb
[license-src]: https://img.shields.io/npm/l/kysely-mariadb.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/kysely-mariadb
[ci-src]: https://github.com/AwaludinAR/kysely-mariadb/actions/workflows/ci.yaml/badge.svg
[ci-href]: https://github.com/AwaludinAR/kysely-mariadb/actions/workflows/ci.yaml
