# Mariadb Dialect for Kysely

[![npm version][npm-version-src]][npm-version-href]
[![License][license-src]][license-href]

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
[license-src]: https://img.shields.io/npm/l/nuxt-authorizer.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-authorizer
