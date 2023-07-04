import { eq } from "drizzle-orm";
import Cookies from "js-cookie";
import server$ from "solid-start/server";
import { plannerdata } from "~/db/schema";
import { db } from "../db_client";
import { getAuth } from "../getAuth";
import { saveEntities } from "./saveEntities";
import { Entity, Item } from "~/types_const/planner";
import { addGroup, addItem } from "./addItemGroup";
import { SetStoreFunction } from "solid-js/store";
import { Id } from "@thisbeyond/solid-dnd";

export const getEntities = async (nextID: number, nextOrder: number, entities: Record<Id, Entity>, setEntities: SetStoreFunction<Record<Id, Entity>>, plannerid: number) => {
    const getAllEntities = server$(async (token:string|undefined, plannerid: number) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
            const userplanner = await db.select().from(plannerdata).where(eq(plannerdata.plannerid, plannerid));
            return userplanner;
        } else {
            return [];
        }
    })
    const planneritems = await getAllEntities(Cookies.get("auth"), plannerid);
    if (planneritems?.length == 0) {
        addGroup(nextID, "Upcoming", nextOrder.toString(), setEntities);
        addGroup(nextID+1, "Ongoing", nextOrder.toString(), setEntities);
        addGroup(nextID+2, "Completed", nextOrder.toString(), setEntities);
        saveEntities(entities, plannerid);
    } else {
        for (let entity of planneritems) {
            if (entity.type == "item") {
                addItem({
                  id: entity.id, 
                  order: entity.ordernum!, 
                  name: entity.name!, 
                  group: entity.groupid!, 
                  type: "item",
                  startdate: entity.startdate!,
                  duedate: entity.duedate!, 
                  progress: entity.progress!, 
                  description: entity.description!, 
                  checklist: JSON.parse(entity.checklist!),
                  priority: entity.priority!, 
                  // @ts-ignore
                  lastupdate: entity.lastupdate, externalfiles: entity.externalfiles, externallinks: entity.externallinks}, setEntities)
            } else {
                addGroup(entity.id, entity.name!, entity.ordernum!, setEntities)
            }
            if (entity.id >= nextID) {
                nextID = (entity.id + 1); 
            }
            nextOrder += 1;
        }
    }
    return {nextID: nextID, nextOrder: nextOrder};
}