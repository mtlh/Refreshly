import { connect } from '@planetscale/database'
import { config } from '~/functions/db_config';

export async function GET() {
    const conn = connect(config)
    await conn.execute('CREATE TABLE IF NOT EXISTS test ( id INT PRIMARY KEY, test VARCHAR(255) NOT NULL)');
    await conn.execute('INSERT IGNORE INTO test VALUES (?,?)', [1, "Complete"]);
    // @ts-ignore
    const sel = (await conn.execute('SELECT test FROM test WHERE id = ?', [1])).rows[0].test;
    await conn.execute('DROP TABLE test');
    return new Response("No Sleep " + sel);
}