import server$ from "solid-start/server";
import { db } from "../db_client";
import { planner } from "~/db/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "../getAuth";


export const PlannerAuth = server$(async (token: string, url: string) => {
    const isauth = await getAuth(token);
    if (isauth.loggedin == true) {

        const getIDfromURL = await db.select().from(planner)
        .where(eq(planner.url, url))

        const json_members = JSON.parse(getIDfromURL[0].members);

        var isfound = false;
        json_members.forEach((username: string) => {
            if (username == isauth.user.username) {
                isfound = true;
            }
        });
        if (isfound) {
            return getIDfromURL[0].id
        } else {
            return 0
        }
    } else {
        return 0;
    }
});