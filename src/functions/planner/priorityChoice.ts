import server$ from "solid-start/server";
import { getAuth } from "../getAuth";
import { db } from "../db_client";
import { eq } from "drizzle-orm";
import Cookies from "js-cookie";
import { planner } from "~/db/schema";

export const getPriorityChoice = async (plannerid: number) => {
    const getPriorityChoice = server$(async (token:string|undefined, plannerid: number) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
            const userplanner = await db.select().from(planner).where(eq(planner.id, plannerid));
            return userplanner[0].prioritychoice;
        } else {
            return "[]";
        }
    })
    const prioritychoice = await getPriorityChoice(Cookies.get("auth"), plannerid);
    return JSON.parse(prioritychoice!);
  };
  
  export const UpdatePriorityChoice = async (prioritychoice: string[], plannerid: number) => {
    const UpdatePriorityChoice = server$(async (token:string|undefined, prioritychoice: string[], plannerid: number) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
          const updateprioritychoice = await db.update(planner).set({prioritychoice: JSON.stringify(prioritychoice)}).where(eq(planner.id, plannerid));
        }
    })
    const callupdate = await UpdatePriorityChoice(Cookies.get("auth"), prioritychoice, plannerid);
  };