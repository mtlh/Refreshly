import { Client } from '@planetscale/database';
import { drizzle } from 'drizzle-orm/planetscale-serverless'
import { config } from './db_config';

const client = new Client({
  fetch,
  host: config.host,
  username: config.username,
  password: config.password
})

const connection = client.connection();
export const db = drizzle(connection);