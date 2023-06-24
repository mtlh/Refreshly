import server$ from "solid-start/server";
import { getAuth } from "../getAuth";
import { db } from "../db_client";
import { customise } from "~/db/schema";
import { eq } from "drizzle-orm";
import Cookies from "js-cookie";

export const getProgressChoice = async () => {
    const getProgressChoice = server$(async (token:string|undefined) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
            const userplanner = await db.select().from(customise).where(eq(customise.username, auth_checked.user.username));
            return userplanner[0].progresschoice;
        } else {
            return "[]";
        }
    })
    const progresschoice = await getProgressChoice(Cookies.get("auth"));
    return JSON.parse(progresschoice!);
  };
  
  export const UpdateProgressChoice = async (progresschoice: string[]) => {
    const UpdateProgressChoice = server$(async (token:string|undefined, progresschoice: string[]) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
          const updateprogresschoice = await db.update(customise).set({progresschoice: JSON.stringify(progresschoice)}).where(eq(customise.username, auth_checked.user.username));
        }
    })
    const boardcolnum = await UpdateProgressChoice(Cookies.get("auth"), progresschoice);
  };