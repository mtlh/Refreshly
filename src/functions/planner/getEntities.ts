import { eq } from "drizzle-orm";
import Cookies from "js-cookie";
import server$ from "solid-start/server";
import { planner } from "~/db/schema";
import { db } from "../db_client";
import { getAuth } from "../getAuth";
import { saveEntities } from "./saveEntities";
import { Entity, Item } from "~/types_const/planner";
import { addGroup, addItem } from "./addItemGroup";
import { SetStoreFunction } from "solid-js/store";
import { Id } from "@thisbeyond/solid-dnd";

export const getEntities = async (nextID: number, nextOrder: number, entities: Record<Id, Entity>, setEntities: SetStoreFunction<Record<Id, Entity>>) => {
    const getAllEntities = server$(async (token:string|undefined) => {
        const auth_checked = await getAuth(token);
        if (auth_checked.loggedin == true) {
        const userplanner = await db.select().from(planner).where(eq(planner.username, auth_checked.user.username));
        return userplanner;
        } else {
        return [];
        }
    })
    const planneritems = await getAllEntities(Cookies.get("auth"));
    if (planneritems?.length == 0) {
        addGroup(nextID, "Upcoming", nextOrder.toString(), setEntities);
        addGroup(nextID+1, "Ongoing", nextOrder.toString(), setEntities);
        addGroup(nextID+2, "Completed", nextOrder.toString(), setEntities);
        saveEntities(entities);
    } else {
        for (let entity of planneritems) {
            // @ts-ignore
            let ent: Entity = entity;
            if (entity.type == "item") {
                // @ts-ignore
                let item: Item = ent;
                addItem(item, setEntities)
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