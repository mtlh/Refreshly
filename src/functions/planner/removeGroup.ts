import server$ from "solid-start/server";
import { db } from "../db_client";
import { planner } from "~/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuth } from "../getAuth";

export async function removeGroup(id: number, token: string) {
    const removeGroup = server$(async (id: number, token: string) => {

        const isauth = await getAuth(token);
        if (isauth.loggedin == true) {
            const remove_item_from_db = await db.delete(planner).where(and(eq(planner.username, isauth.user.username), eq(planner.id, id)));
        }
    })
    removeGroup(id, token);
}