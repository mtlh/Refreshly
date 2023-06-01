import { boolean, json, mysqlDatabase, mysqlTable, serial, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  token: varchar('token', {length: 256}).notNull(),
  created: timestamp('created').defaultNow().notNull()
});

export const customise = mysqlTable('customise', {
  id: serial('id').primaryKey().notNull(),
  username: varchar('username', { length: 256 }).notNull(),
  dashboard: boolean('dashboard').notNull().default(true),
  planner: boolean('planner').notNull().default(true),
  inbox: boolean('inbox').notNull().default(true),
  teams: boolean('teams').notNull().default(true),
  projects: boolean('projects').notNull().default(true),
  profile: boolean('profile').notNull().default(true),
  settings: boolean('settings').notNull().default(true)
});

export const planner = mysqlTable('planner', {
  givenid: serial('id').primaryKey().notNull(),
  username: varchar('username', {length: 256}).notNull(),
  name: varchar('taskname', {length: 256}).notNull(),
  type: varchar('type', {length: 256}).notNull(),
  order: varchar('order', {length: 256}),
  group: varchar('group', {length: 256}),
  startdate: timestamp('startdate').defaultNow(),
  duedate: timestamp('duedate'),
  progress: varchar('progress', {length: 256}),
  description: varchar('description', {length: 256}),
  checklist: varchar('checklist', {length: 999999999999999}),
  priority: varchar('prority', {length: 256})
});