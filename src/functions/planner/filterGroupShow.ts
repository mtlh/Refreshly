import server$ from "solid-start/server";
import { getAuth } from "../getAuth";
import { db } from "../db_client";
import { customise } from "~/db/schema";
import { eq } from "drizzle-orm";
import Cookies from "js-cookie";

export const getGroupShowFilter = async () => {
    const getGroupShowFilter = server$(async (token:string|undefined) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
            const userplanner = await db.select().from(customise).where(eq(customise.username, auth_checked.user.username));
            return userplanner[0].groupfilter;
        } else {
            return "";
        }
    })
    const groupfilter = await getGroupShowFilter(Cookies.get("auth"));
    return JSON.parse(groupfilter);
  };
  
  export const UpdateGroupShowFilter = async (newarr: boolean[]) => {
    const UpdateGroupShowFilter = server$(async (token:string|undefined, newarr: boolean[]) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
          const updategroupshow = await db.update(customise).set({groupfilter: JSON.stringify(newarr)}).where(eq(customise.username, auth_checked.user.username));
        }
    })
    const boardcolnum = await UpdateGroupShowFilter(Cookies.get("auth"), newarr);
  };
  