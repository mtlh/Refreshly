import { connect } from '@planetscale/database'
import { config } from '~/functions/db_config';

export async function GET() {
    const conn = connect(config)
    await conn.execute('CREATE TABLE IF NOT EXISTS nosleep ( id INT PRIMARY KEY, test VARCHAR(255) NOT NULL)');
    await conn.execute('INSERT IGNORE INTO nosleep VALUES (?,?)', [1, "Complete"]);
    // @ts-ignore
    const sel = (await conn.execute('SELECT test FROM nosleep WHERE id = ?', [1])).rows[0].test;
    await conn.execute('DROP TABLE nosleep');
    return new Response("No Sleep " + sel);
}