import server$ from "solid-start/server";
import { getAuth } from "../getAuth";
import { db } from "../db_client";
import { customise } from "~/db/schema";
import { eq } from "drizzle-orm";
import Cookies from "js-cookie";

export const getPriorityChoice = async () => {
    const getPriorityChoice = server$(async (token:string|undefined) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
            const userplanner = await db.select().from(customise).where(eq(customise.username, auth_checked.user.username));
            return userplanner[0].prioritychoice;
        } else {
            return "[]";
        }
    })
    const prioritychoice = await getPriorityChoice(Cookies.get("auth"));
    return JSON.parse(prioritychoice!);
  };
  
  export const UpdatePriorityChoice = async (prioritychoice: string[]) => {
    const UpdatePriorityChoice = server$(async (token:string|undefined, prioritychoice: string[]) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
          const updateprioritychoice = await db.update(customise).set({prioritychoice: JSON.stringify(prioritychoice)}).where(eq(customise.username, auth_checked.user.username));
        }
    })
    const callupdate = await UpdatePriorityChoice(Cookies.get("auth"), prioritychoice);
  };