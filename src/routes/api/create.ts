import { connect } from '@planetscale/database'
import { config } from '~/functions/db_config';

const conn = connect(config);

export async function GET() {

    //await conn.execute('DROP TABLE users');
    const users: string = 'CREATE TABLE IF NOT EXISTS users ( '+
        'id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, '+
        'username VARCHAR(255) NOT NULL, '+
        'name VARCHAR(255) NOT NULL, '+
        'email VARCHAR(255) NOT NULL, '+
        'imgurl VARCHAR(255) NOT NULL '+
    ')';
    console.log(users);
    await conn.execute(users);

    return new Response("Created");
}