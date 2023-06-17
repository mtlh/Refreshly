import { and, eq } from "drizzle-orm";
import Cookies from "js-cookie";
import { customise, planner } from "~/db/schema";
import { db } from "~/functions/db_client";
import { getAuth } from "~/functions/getAuth";
import server$ from "solid-start/server";
import { For, batch, createEffect, createSignal, onMount } from "solid-js";
import moment from "moment";
import { createStore } from "solid-js/store";
import { Id } from "@thisbeyond/solid-dnd";
import { Entity, Item } from "./PlannerBoard";
import { removeGroup } from "~/functions/planner/removeGroup";

export const ORDER_DELTA = 1;
export const ID_DELTA = 1;

export const PlannerOptions = () => {
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
            let tempgroup = [];
            let tempitem: Item[] = [];
            for (var x in entities) { if (entities[x].type == "group") {tempgroup.push(entities[x].id); } else { tempitem.push(entities[x])}};
            for (var y in tempitem) {
              if ( !tempgroup.includes(tempitem[y].group)) {
                await db.delete(planner).where(and(eq(planner.id, tempitem[y].id), eq(planner.username, auth_checked.user.username)));
              }
            }
          }
        })
        await db_insert_entities(entities, Cookies.get("auth"));
    }

    const [boardcol, SetBoardCol] = createSignal(0);
    const increment = () => {UpdateBoardCol(boardcol() + 1); SetBoardCol(boardcol() + 1)};
    const decrement = () => {UpdateBoardCol(boardcol() - 1); SetBoardCol(boardcol() - 1)};

    const setup = () => {
    batch(async () => {
        getEntities();
        SetBoardCol(await getBoardCol());
    });
    };
    onMount(setup);

    const [groupCount, setGroupCount] = createSignal(new Array());
    createEffect(() => {
        let tempgroup = [];
        for (var x in entities) { if (entities[x].type == "group") {tempgroup.push(entities[x]); }};
        setGroupCount(tempgroup);
    }, [entities])
    return (
        <>
            <div class="grid grid-cols-1 p-4 text-left">
                <div class="my-2">
                    <p class="text-xl underline font-bold">Edit current groups:</p>
                    <p>Please note these can be ordered by drag&drop within the board section.</p>
                    <div class="grid grid-cols-1">
                      <For each={groupCount()}>{(group) =>
                        <>
                          <div class="grid grid-cols-4">
                            <input value={group.name} class="input my-1 col-span-3"
                            onchange={(e)=> {setEntities(group.id, "name", e.target.value); saveEntities();}} />
                            <button class="m-auto" onclick={async () => {
                              let removeid: number = 99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999;
                              for (var x in entities) {
                                if (group == entities[x]) {
                                  removeid = parseInt(x);
                                }
                              }
                              await removeGroup(removeid, Cookies.get("auth")!);
                              location.href = "/planner?options=true";
                            }}>
                              <svg viewBox="0 0 24 24" class="m-auto w-5" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.73708 6.54391V18.9857C5.73708 19.7449 6.35257 20.3604 7.11182 20.3604H16.8893C17.6485 20.3604 18.264 19.7449 18.264 18.9857V6.54391M2.90906 6.54391H21.0909" stroke="#1C1C1C" stroke-width="1.7" stroke-linecap="round"></path> <path d="M8 6V4.41421C8 3.63317 8.63317 3 9.41421 3H14.5858C15.3668 3 16 3.63317 16 4.41421V6" stroke="#1C1C1C" stroke-width="1.7" stroke-linecap="round"></path> </g></svg>
                            </button>
                          </div>
                        </>
                      }</For>
                    </div>
                </div>
                <button
                  class="text-2xl my-4 font-bold w-full rounded-lg hover:ring-sky-600 hover:ring-1"
                  onClick={()=> {
                    let newid = getNextID();
                    let ordernum = getNextOrder();
                    addGroup(newid, "New Group", ordernum);
                    saveEntities();
                }}>
                  +
                </button>
                <div class="my-2">
                  <p class="text-xl underline font-bold">Board column amount:</p>
                  <div class="flex items-center p-2">
                    <button
                      class="bg-sky-800 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-l"
                      onClick={decrement}
                    >
                      -
                    </button>
                    <p class="text-2xl mx-4">{boardcol()}</p>
                    <button
                      class="bg-sky-800 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-r"
                      onClick={increment}
                    >
                      +
                    </button>
                  </div>
                </div>
            </div>
        </>
    );
};


export const getBoardCol = async () => {
  const getBoardCol = server$(async (token:string|undefined) => {
      const auth_checked = await getAuth(token);
      if (auth_checked.loggedin == true) {
      const userplanner = await db.select().from(customise).where(eq(customise.username, auth_checked.user.username));
      return userplanner;
      } else {
      return [];
      }
  })
  const boardcolnum = await getBoardCol(Cookies.get("auth"));
  let boardcol: number = 4;
  boardcolnum.map(settings => boardcol = settings.boardcol);
  return boardcol;
};

export const UpdateBoardCol = async (newnum: number) => {
  const UpdateBoardCol = server$(async (token:string|undefined, newnum: number) => {
      const auth_checked = await getAuth(token);
      if (auth_checked.loggedin == true) {
        const updateboardcol = await db.update(customise).set({boardcol: newnum}).where(eq(customise.username, auth_checked.user.username));
      }
  })
  const boardcolnum = await UpdateBoardCol(Cookies.get("auth"), newnum);
};
