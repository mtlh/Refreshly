import { getAuth } from "../getAuth";
import server$ from "solid-start/server";
import moment from "moment";
import { plannerdata } from "~/db/schema";
import { and, eq } from "drizzle-orm";
import Cookies from "js-cookie";
import { db } from "../db_client";
import { Id } from "@thisbeyond/solid-dnd";
import { Entity, Item } from "~/types_const/planner";

export const saveEntities = async (entities: Record<Id, Entity>, plannerid: number) => {
    const saveEntities = server$(async (entities: Record<Id, Entity>, token:string|undefined, plannerid: number) => {
      const auth_checked = await getAuth(token);
      if (auth_checked.loggedin == true) {
        for (var x in entities) {
          if (entities[x].type == "item") {
            // @ts-ignore
            let item: Item = entities[x];
            let startdate = item.startdate; let duedate = item.duedate
            if (item.startdate) {startdate = moment(item.startdate).format("YYYY-MM-DD"); }
            if (item.duedate) {duedate = moment(item.duedate).format("YYYY-MM-DD"); }
            const checktasks = await db.select().from(plannerdata).where(and(eq(plannerdata.id, item.id), eq(plannerdata.username, auth_checked.user.username)))
            if (checktasks.length > 0) {
              const updatetasks = await db.update(plannerdata).set({
                name: item.name,
                ordernum: item.order,
                groupid: item.group,
                startdate: startdate,
                duedate: duedate,
                progress: item.progress,
                description: item.description,
                checklist: JSON.stringify(item.checklist),
                priority: item.priority,
                lastupdate: new Date(item.lastupdate),
                //externallinks: JSON.stringify(item.externallinks),
                //externalfiles: item.externalfiles
              }).where(and(eq(plannerdata.id, item.id), eq(plannerdata.username, auth_checked.user.username)))
            } else {
              const inserttasks = await db.insert(plannerdata).values({
                username: auth_checked.user.username,
                id: item.id,
                plannerid: plannerid,
                name: item.name,
                type: item.type,
                ordernum: item.order,
                groupid: item.group,
                startdate: startdate,
                duedate: duedate,
                progress: item.progress,
                description: item.description,
                checklist: JSON.stringify(item.checklist),
                priority: item.priority,
                lastupdate: new Date(item.lastupdate),
                // externallinks: JSON.stringify(item.externallinks),
                // externalfiles: item.externalfiles
              });
            }
          } else {
            // @ts-ignore
            let group: Group = entities[x];
            const checkgroup = await db.select().from(plannerdata).where(and(eq(plannerdata.id, group.id), eq(plannerdata.username, auth_checked.user.username)))
            if (checkgroup.length > 0) {
              const updategroups = await db.update(plannerdata).set({
                name: group.name,
                ordernum: group.order
              }).where(and(eq(plannerdata.id, group.id), eq(plannerdata.username, auth_checked.user.username)))
            } else {
              const updategroups = await db.insert(plannerdata).values({
                username: auth_checked.user.username,
                id: group.id,
                plannerid: plannerid,
                name: group.name,
                type: group.type,
                ordernum: group.order
              });
            }
          }
        }
        let tempgroup = [];
        let tempitem: Item[] = [];
        for (var x in entities) { 
          let entity: Entity = entities[x];
          if (entity.type == "group") {
            tempgroup.push(entity.id); 
          } 
          else {
            tempitem.push(entity)
          }
        };
        for (var y in tempitem) {
          // @ts-ignore
          if (!tempgroup.includes(tempitem[y].group) && !tempgroup.includes(tempitem[y].groupid)) {
            await db.delete(plannerdata).where(and(eq(plannerdata.id, tempitem[y].id), eq(plannerdata.username, auth_checked.user.username)));
          }
        }
      }
    })
    await saveEntities(entities, Cookies.get("auth"), plannerid);
}