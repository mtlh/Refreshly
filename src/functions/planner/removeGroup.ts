import server$ from "solid-start/server";
import { db } from "../db_client";
import { plannerdata } from "~/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuth } from "../getAuth";

export async function removeGroup(id: number, token: string) {
    const removeGroup = server$(async (id: number, token: string) => {

        const isauth = await getAuth(token);
        if (isauth.loggedin == true) {
            const remove_item_from_db = await db.delete(plannerdata).where(and(eq(plannerdata.username, isauth.user.username), eq(plannerdata.id, id)));
        }
    })
    removeGroup(id, token);
}