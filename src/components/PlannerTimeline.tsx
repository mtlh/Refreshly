import { and, eq } from "drizzle-orm";
import Cookies from "js-cookie";
import moment from "moment";
import { For, batch, createEffect, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import server$ from "solid-start/server";
import { planner } from "~/db/schema";
import { db } from "~/functions/db_client";
import { getAuth } from "~/functions/getAuth";
import { ID_DELTA, ORDER_DELTA } from "./PlannerOptions";
import { Entity } from "./PlannerBoard";
import { Id } from "@thisbeyond/solid-dnd";

export const PlannerTimeline = () => {
    let nextOrder = 1;
    let nextID = 1;
    const getNextID = () => {
      nextID += ID_DELTA;
      return nextID;
    }
    const getNextOrder = () => {
      nextOrder += ORDER_DELTA;
      return nextOrder.toString();
    };

    const [entities, setEntities] = createStore<Record<Id, Entity>>({});
    const addGroup = (id: number, name: string, order: string) => {
        setEntities(id, {
            id,
            name,
            type: "group",
            order,
        });
    };
    // @ts-ignore
    const addItem = (id: number, order: string, name: string, group: number, startdate?: string, duedate?: string, progress: any,
    description: string, checklist: any[], priority: "High" | "Medium" | "Low" | "Urgent" | "", lastupdate:  string) => {
    if (!lastupdate) {
        lastupdate = moment(new Date()).format("HH:mm DD-MM-YYYY").toString()
    }
    setEntities(id, {
        id,
        name,
        group,
        startdate,
        duedate,
        priority,
        description,
        checklist,
        progress,
        type: "item",
        order,
        lastupdate
    });
    };
    const getEntities = async () => {
        const getAllEntities = server$(async (token:string|undefined) => {
            const auth_checked = await getAuth(token);
            if (auth_checked.loggedin == true) {
            const userplanner = await db.select().from(planner).where(eq(planner.username, auth_checked.user.username));
            return userplanner;
            } else {
            return null;
            }
        })
        const planneritems = await getAllEntities(Cookies.get("auth"));
        if (planneritems?.length == 0) {
            addGroup(getNextID(), "Upcoming", getNextOrder());
            addGroup(getNextID(), "Ongoing", getNextOrder());
            addGroup(getNextID(), "Completed", getNextOrder());
            saveEntities();
        } else {
            for (var entity in planneritems) {
            if (planneritems[entity].type == "item") {
                addItem(planneritems[entity].id, planneritems[entity].ordernum, planneritems[entity].name, planneritems[entity].groupid, planneritems[entity].startdate
                , planneritems[entity].duedate, planneritems[entity].progress, planneritems[entity].description, JSON.parse(planneritems[entity].checklist), planneritems[entity].priority, planneritems[entity].lastupdate)
            } else {
                addGroup(planneritems[entity].id, planneritems[entity].name, planneritems[entity].ordernum)
            }
            if (planneritems[entity].id >= nextID) {
                nextID = (planneritems[entity].id + 1); 
            }
            nextOrder += 1;
            }
        }
    }
    const saveEntities = async () => {
        const db_insert_entities = server$(async (entities: any[], token:string|undefined) => {
          const auth_checked = await getAuth(token);
          if (auth_checked.loggedin == true) {
            for (var x in entities) {
              if (entities[x].type == "item") {
                // @ts-ignore
                let item: Item = entities[x];
                let startdate = item.startdate; let duedate = item.duedate
                if (item.startdate) {startdate = moment(item.startdate).format("YYYY-MM-DD"); }
                if (item.duedate) {duedate = moment(item.duedate).format("YYYY-MM-DD"); }
                const checktasks = await db.select().from(planner).where(and(eq(planner.id, item.id), eq(planner.username, auth_checked.user.username)))
                if (checktasks.length > 0) {
                  const updatetasks = await db.update(planner).set({
                    name: item.name,
                    ordernum: item.order,
                    groupid: item.group,
                    startdate: startdate,
                    duedate: duedate,
                    progress: item.progress,
                    description: item.description,
                    checklist: JSON.stringify(item.checklist),
                    priority: item.priority,
                    lastupdate: new Date(item.lastupdate)
                  }).where(and(eq(planner.id, item.id), eq(planner.username, auth_checked.user.username)))
                } else {
                  const inserttasks = await db.insert(planner).values({
                    username: auth_checked.user.username,
                    id: item.id,
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
                    lastupdate: new Date(item.lastupdate)
                  });
                }
              } else {
                // @ts-ignore
                let group: Group = entities[x];
                const checkgroup = await db.select().from(planner).where(and(eq(planner.id, group.id), eq(planner.username, auth_checked.user.username)))
                if (checkgroup.length > 0) {
                  const updategroups = await db.update(planner).set({
                    name: group.name,
                    ordernum: group.order
                  }).where(and(eq(planner.id, group.id), eq(planner.username, auth_checked.user.username)))
                } else {
                  const updategroups = await db.insert(planner).values({
                    username: auth_checked.user.username,
                    id: group.id,
                    name: group.name,
                    type: group.type,
                    ordernum: group.order
                  });
                }
              }
            }
          }
        })
        await db_insert_entities(entities, Cookies.get("auth"));
    }

    const setup = () => {
    batch(async () => {
        getEntities();
    });
    };
    onMount(setup);
    
    const [taskCount, setTaskCount] = createSignal(new Array());
    createEffect(() => {
        let tempgroup = [];
        for (var x in entities) { if (entities[x].type == "item") {tempgroup.push(entities[x]); }};
        setTaskCount(tempgroup);
    }, [entities])

    return (
        <>
            <div class={""}>
                Timeline
            </div>
            <For each={taskCount()}>{(task) =>
            <>
                <div class="grid grid-cols-4">
                {task.name}
                </div>
            </>
            }</For>
        </>
    );
};