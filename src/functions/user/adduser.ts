import server$ from "solid-start/server"
import { connect } from '@planetscale/database'
import { config } from '~/functions/db_config';
import { db } from "../db_client";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";

const conn = connect(config);

export async function addusertodb(name: string | null | undefined, email: string | null | undefined, imgurl: string | null | undefined) {
    const addUser = server$(async (name, email, imgurl) => {

        const username = name.replace(' ' ,'-');

        const doesemail_result = await db.select().from(users).where(eq(users.email, email));

        if (doesemail_result.length == 0) {
            await db.insert(users).values({username: username, name: name, email: email, imgurl: imgurl})
        }
    })
    addUser(name, email, imgurl)
}