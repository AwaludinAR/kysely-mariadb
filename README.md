# Mariadb Dialect for Kysely

## Installation

### Node.js

```bash
npm install github.com:awaludinar/kysely-mariadb
```

### Bun

```bash
bun add github.com:awaludinar/kysely-mariadb
```

## Usage

### Node.js

```ts
import type { GeneratedAlways, Generated } from "kysely";
import { Kysely } from "kysely";
import { createPool } from "mariadb";
import { MariadbDialect } from "@awaludinar/kysely-mariadb";

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
import { MariadbDialect } from "@awaludinar/kysely-mariadb";

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
