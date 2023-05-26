import { connect } from '@planetscale/database'
import { config } from '~/functions/db_config';

const conn = connect(config);

export async function GET() {

    await conn.execute('DROP TABLE IF EXISTS users');
    const users: string = 'CREATE TABLE IF NOT EXISTS users ( '+
        'id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, '+
        'username VARCHAR(255) NOT NULL, '+
        'name VARCHAR(255) NOT NULL, '+
        'email VARCHAR(255) NOT NULL, '+
        'imgurl VARCHAR(255) NOT NULL '+
    ')';
    console.log(users);
    await conn.execute(users);

    await conn.execute('DROP TABLE IF EXISTS auth');
    const auth: string = 'CREATE TABLE IF NOT EXISTS auth ( '+
        'id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, '+
        'username VARCHAR(255) NOT NULL, '+
        'displayname VARCHAR(255), '+
        'email VARCHAR(255) NOT NULL, '+
        'pass VARCHAR(255) NOT NULL, '+
        'imgurl VARCHAR(255) NOT NULL, '+
        'validemail BOOLEAN NOT NULL, '+
        'token VARCHAR(256) NOT NULL, '+
        'created timestamp NOT NULL DEFAULT now() '+
    ')';
    console.log(auth);
    await conn.execute(auth);


    return new Response("Created");
}