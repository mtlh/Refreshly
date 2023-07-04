import server$ from "solid-start/server";
import { db } from "../db_client";
import { planner, planner_roles } from "~/db/schema";
import { getAuth } from "../getAuth";
import { generatetoken } from "../generatetoken";
import { and, eq } from "drizzle-orm";


export const createPlanner = server$(async (token: string) => {
    const isauth = await getAuth(token);
    if (isauth.loggedin == true) {

        const newurl = generatetoken(10);
        const insertPlanner = await db.insert(planner).values({
            url: newurl,
            members: '["' + isauth.user.username + '"]'
        });

        const selectPlannerID = await db.select().from(planner).where(eq(planner.url, newurl));

        const insertRole = await db.insert(planner_roles).values({
            username: isauth.user.username,
            role: "admin",
            plannerid: selectPlannerID[0].id
        });

        const newPlanners = await db.select().from(planner_roles).leftJoin(planner, eq(planner.id, planner_roles.plannerid)).where(and(eq(planner_roles.username, isauth.user.username)));

        return newPlanners;
    }
    return []
});