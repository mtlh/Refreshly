import server$ from "solid-start/server";
import { getAuth } from "../getAuth";
import { db } from "../db_client";
import { planner } from "~/db/schema";
import { and, eq } from "drizzle-orm";

export const GetPreview = server$(async (token: string, link:string) => {

    const auth_checked = await getAuth(token);
    if (auth_checked.loggedin == true) {
        const response = await fetch(`https://filmfront.vercel.app/api/Refreshly/LinkPreview?link=${link}`);
        if (!response.ok) {
        throw new Error(`HTTP status code: ${response.status}`);
        }
        const metadata = await response.json();
        return metadata;
    }
    return {};
});

export const LoadPreview = server$(async (token: string, id: number) => {

    const auth_checked = await getAuth(token);
    if (auth_checked.loggedin == true) {
        const auth_checked = await getAuth(token);
        const userplanner = await db.select().from(planner).where(and(eq(planner.username, auth_checked.user.username), eq(planner.id, id)));
        if (JSON.parse(userplanner[0].externallinks!)) {
            return JSON.parse(userplanner[0].externallinks!);
        } else {
            return [];
        }
    }
    return [];
});

export const SavePreview = server$(async (token: string, datalist: Object[], id: number) => {

    const auth_checked = await getAuth(token);
    if (auth_checked.loggedin == true) {
        let data_to_save = JSON.stringify(datalist);
        const userplanner = await db.update(planner).set({externallinks: data_to_save}).where(and(eq(planner.username, auth_checked.user.username), eq(planner.id, id)));
    }
    return null;
});