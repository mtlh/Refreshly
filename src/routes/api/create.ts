import { connect } from '@planetscale/database'
import { customise } from '~/db/schema';
import { db } from '~/functions/db_client';
import { config } from '~/functions/db_config';
import { encrypt } from '~/functions/encrypt';

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
        'token VARCHAR(255) NOT NULL, '+
        'created timestamp NOT NULL DEFAULT now() '+
    ')';
    console.log(auth);
    await conn.execute(auth);

    const insertstring = "INSERT INTO auth (username, displayname, email, pass, imgurl, validemail, token) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const insertvalues = ['demouser', 'demouser', 'matthewtlharvey@gmail.com', await encrypt('thisisademoaccount'), 'https://eu.ui-avatars.com/api/?name=demouser', false, 'jiogjnangooajg']
    await conn.execute(insertstring, insertvalues);
    console.log(insertstring, insertvalues);

    await conn.execute('DROP TABLE IF EXISTS customise');
    const custom: string = 'CREATE TABLE IF NOT EXISTS customise ( '+
        'id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, '+
        'username VARCHAR(255) NOT NULL, '+
        'dashboard BOOLEAN NOT NULL DEFAULT (true), '+
        'planner BOOLEAN NOT NULL DEFAULT (true), '+
        'inbox BOOLEAN NOT NULL DEFAULT (true), '+
        'teams BOOLEAN NOT NULL DEFAULT (true), '+
        'projects BOOLEAN NOT NULL DEFAULT (true), '+
        'profile BOOLEAN NOT NULL DEFAULT (true), '+
        'settings BOOLEAN NOT NULL DEFAULT (true), '+
        'boardcol INT NOT NULL DEFAULT (4), '+
        'groupfilter VARCHAR(255) DEFAULT ("[]"), '+
        'imgtest LONGBLOB, '+
        'progresschoice VARCHAR(255) DEFAULT ("[]"), '+
        'prioritychoice VARCHAR(255) DEFAULT ("[]") '+
    ')';
    console.log(custom);
    await conn.execute(custom);

    const insertcustom = await db.insert(customise).values({username: "demouser"});
    console.log(insertcustom);

    await conn.execute('DROP TABLE IF EXISTS planner');
    const planner: string = 'CREATE TABLE IF NOT EXISTS planner ( '+
        'givenid INT PRIMARY KEY AUTO_INCREMENT NOT NULL, '+
        'username VARCHAR(255) NOT NULL, '+
        'id INTEGER NOT NULL, '+
        'name VARCHAR(255), '+
        'type VARCHAR(255) NOT NULL, '+
        'ordernum VARCHAR(255), '+
        'groupid VARCHAR(255), '+
        'startdate DATE, '+
        'duedate DATE, '+
        'progress VARCHAR(255), '+
        'description VARCHAR(255), '+
        'checklist TEXT, '+
        'priority VARCHAR(255), '+
        'lastupdate TIMESTAMP NOT NULL DEFAULT now(), '+
        'externallinks TEXT, '+
        'externalfiles LONGBLOB '+
    ')';
    console.log(planner);
    await conn.execute(planner);

    return new Response("Created");
}