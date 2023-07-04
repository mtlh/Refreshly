import server$ from "solid-start/server";
import { getAuth } from "../getAuth";
import { db } from "../db_client";
import { planner } from "~/db/schema";
import { eq } from "drizzle-orm";
import Cookies from "js-cookie";

export const getGroupShowFilter = async (plannerid: number) => {
    const getGroupShowFilter = server$(async (token:string|undefined, plannerid:number) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
            const userplanner = await db.select().from(planner).where(eq(planner.id, plannerid));
            console.log(userplanner)
            return userplanner[0].groupfilter;
        } else {
            return "";
        }
    })
    const groupfilter = await getGroupShowFilter(Cookies.get("auth"), plannerid);
    return JSON.parse(groupfilter);
  };
  
  export const UpdateGroupShowFilter = async (newarr: boolean[], plannerid: number) => {
    const UpdateGroupShowFilter = server$(async (token:string|undefined, newarr: boolean[], plannerid: number) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
          const updategroupshow = await db.update(planner).set({groupfilter: JSON.stringify(newarr)}).where(eq(planner.id, plannerid));
        }
    })
    const boardcolnum = await UpdateGroupShowFilter(Cookies.get("auth"), newarr, plannerid);
  };
  