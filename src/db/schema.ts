import { mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";

//npx drizzle-kit generate:mysql --out migrations-folder --schema src/db/schema.ts

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 256 }),
  name: varchar('name', { length: 256 }),
  email: varchar('email', { length: 256 }),
  imgurl: varchar('imgurl', { length: 256 }),
});