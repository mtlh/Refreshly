import { boolean, mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";

//npx drizzle-kit generate:mysql --out migrations-folder --schema src/db/schema.ts

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 256 }).default(""),
  name: varchar('name', { length: 256 }).default(""),
  email: varchar('email', { length: 256 }).default(""),
  imgurl: varchar('imgurl', { length: 256 }).default(""),
});

export const auth = mysqlTable('auth', {
  id: serial('id').primaryKey().notNull(),
  username: varchar('username', { length: 256 }).notNull(),
  displayname: varchar('displayname', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  pass: varchar('pass', {length: 256}).notNull(),
  imgurl: varchar('imgurl', { length: 256 }).notNull(),
  validemail: boolean('validemail').default(false).notNull(),
  token: varchar('token', {length: 256}).notNull()
});