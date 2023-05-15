import server$ from "solid-start/server"
import { connect } from '@planetscale/database'
import { config } from '~/functions/db_config';

const conn = connect(config);

export async function addusertodb(name: string | null | undefined, email: string | null | undefined, imgurl: string | null | undefined) {
    const addUser = server$(async (name, email, imgurl) => {

        const username = name.replace(' ' ,'-');

        const doesemail: string = 'SELECT * FROM users WHERE email = ?';
        const doesemail_result = await conn.execute(doesemail, [email]);

        if (doesemail_result.size == 0) {
            const adding: string = 'INSERT INTO users (username, name, email, imgurl) VALUES (?,?,?,?)';
            await conn.execute(adding, [username, name, email, imgurl]);
        }
    })
    addUser(name, email, imgurl)
}