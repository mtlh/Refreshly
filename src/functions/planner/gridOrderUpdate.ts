import { eq } from "drizzle-orm";
import server$ from "solid-start/server";
import { customise } from "~/db/schema";
import { db } from "../db_client";
import { getAuth } from "../getAuth";
import { Item } from "~/types_const/planner";

const gridOrderUpdate = server$(async (token:string|undefined, allTasks: Item[]) => {
    const auth_checked = await getAuth(token);
    if (auth_checked.loggedin == true) {
      //const gridOrderUpdate = await db.update(customise).set({progresschoice: JSON.stringify(progresschoice)}).where(eq(customise.username, auth_checked.user.username));
    }
})