import { connect } from '@planetscale/database'
import { config } from '~/functions/db_config';

const conn = connect(config);

export async function GET() {

    // await conn.execute('DROP TABLE IF EXISTS users');
    // const users: string = 'CREATE TABLE IF NOT EXISTS users ( '+
    //     'id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, '+
    //     'username VARCHAR(255) NOT NULL, '+
    //     'name VARCHAR(255) NOT NULL, '+
    //     'email VARCHAR(255) NOT NULL, '+
    //     'imgurl VARCHAR(255) NOT NULL '+
    // ')';
    // console.log(users);
    // await conn.execute(users);

    await conn.execute('DROP TABLE IF EXISTS auth');
    const auth: string = 'CREATE TABLE IF NOT EXISTS auth ( '+
        'id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, '+
        'username VARCHAR(255) NOT NULL, '+
        'displayname VARCHAR(255), '+
        'email VARCHAR(255) NOT NULL, '+
        'pass VARCHAR(255) NOT NULL, '+
        'imgurl VARCHAR(255) NOT NULL, '+
        'validemail BOOLEAN NOT NULL, '+
        'token VARCHAR(255) NOT NULL, '+
        'created timestamp NOT NULL DEFAULT now() '+
    ')';
    console.log(auth);
    await conn.execute(auth);

    await conn.execute('DROP TABLE IF EXISTS customise');
    const customise: string = 'CREATE TABLE IF NOT EXISTS customise ( '+
        'id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, '+
        'username VARCHAR(255) NOT NULL, '+
        'dashboard BOOLEAN NOT NULL DEFAULT (true), '+
        'planner BOOLEAN NOT NULL DEFAULT (true), '+
        'inbox BOOLEAN NOT NULL DEFAULT (true), '+
        'teams BOOLEAN NOT NULL DEFAULT (true), '+
        'projects BOOLEAN NOT NULL DEFAULT (true), '+
        'profile BOOLEAN NOT NULL DEFAULT (true), '+
        'settings BOOLEAN NOT NULL DEFAULT (true) '+
    ')';
    console.log(customise);
    await conn.execute(customise);

    await conn.execute('DROP TABLE IF EXISTS planner');
    const planner: string = 'CREATE TABLE IF NOT EXISTS planner ( '+
        'givenid INT PRIMARY KEY AUTO_INCREMENT NOT NULL, '+
        'username VARCHAR(255) NOT NULL, '+
        'id INTEGER NOT NULL, '+
        'name VARCHAR(255), '+
        'type VARCHAR(255) NOT NULL, '+
        'ordernum VARCHAR(255), '+
        'groupid VARCHAR(255), '+
        'startdate timestamp, '+
        'duedate timestamp, '+
        'progress VARCHAR(255), '+
        'description VARCHAR(255), '+
        'checklist TEXT, '+
        'priority VARCHAR(255) '+
    ')';
    console.log(planner);
    await conn.execute(planner);

    return new Response("Created");
}