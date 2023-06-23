import server$ from "solid-start/server";
import { getAuth } from "../getAuth";
import axios from "axios";
import { db } from "../db_client";
import { planner } from "~/db/schema";
import { and, eq } from "drizzle-orm";

export const GetPreview = server$(async (token: string, link:string) => {

    const auth_checked = await getAuth(token);
    if (auth_checked.loggedin == true) {
        const metadata = await axios.get(`https://filmfront.vercel.app/api/Refreshly/LinkPreview?link=${link}`);
        return metadata.data;
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