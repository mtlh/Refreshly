import server$ from "solid-start/server";
import { getAuth } from "../getAuth";
import { db } from "../db_client";
import { planner } from "~/db/schema";
import { eq } from "drizzle-orm";
import Cookies from "js-cookie";

export const getProgressChoice = async (plannerid: number) => {
    const getProgressChoice = server$(async (token:string|undefined, plannerid: number) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
            const plannerDetails = await db.select().from(planner).where(eq(planner.id, plannerid));
            return plannerDetails[0].progresschoice;
        } else {
            return "[]";
        }
    })
    const progresschoice = await getProgressChoice(Cookies.get("auth"), plannerid);
    return JSON.parse(progresschoice!);
  };
  
  export const UpdateProgressChoice = async (progresschoice: string[], plannerid: number) => {
    const UpdateProgressChoice = server$(async (token:string|undefined, progresschoice: string[], plannerid: number) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
          const updateprogresschoice = await db.update(planner).set({progresschoice: JSON.stringify(progresschoice)}).where(eq(planner.id, plannerid));
        }
    })
    const boardcolnum = await UpdateProgressChoice(Cookies.get("auth"), progresschoice, plannerid);
  };