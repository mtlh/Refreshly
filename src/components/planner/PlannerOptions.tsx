import { eq } from "drizzle-orm";
import Cookies from "js-cookie";
import { db } from "~/functions/db_client";
import { getAuth } from "~/functions/getAuth";
import server$ from "solid-start/server";
import { For, batch, createEffect, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Id } from "@thisbeyond/solid-dnd";
import { removeGroup } from "~/functions/planner/removeGroup";
import { saveEntities } from "~/functions/planner/saveEntities";
import { Entity } from "~/types_const/planner";
import { getEntities } from "~/functions/planner/getEntities";
import { addGroup } from "~/functions/planner/addItemGroup";
import { UpdateProgressChoice, getProgressChoice } from "~/functions/planner/progressChoice";
import { UpdatePriorityChoice, getPriorityChoice } from "~/functions/planner/priorityChoice";
import { planner } from "~/db/schema";

export const ORDER_DELTA = 1;
export const ID_DELTA = 1;

export const PlannerOptions = (props: {id: number}) => {
    let nextOrder = 1;
    let nextID = 1;

    const [entities, setEntities] = createStore<Record<Id, Entity>>({});

    // const [boardcol, SetBoardCol] = createSignal(0);
    // const increment = () => {UpdateBoardCol(boardcol() + 1); SetBoardCol(boardcol() + 1)};
    // const decrement = () => {UpdateBoardCol(boardcol() - 1); SetBoardCol(boardcol() - 1)};

    const [groupCount, setGroupCount] = createSignal(new Array());
    const [progressChoice, setProgressChoice] = createSignal(new Array());
    const [priorityChoice, setPriorityChoice] = createSignal(new Array());

    const setup = () => {
    batch(async () => {
        let ent = await getEntities(nextID, nextOrder, entities, setEntities, props.id); nextID = ent.nextID; nextOrder = ent.nextOrder;
        // SetBoardCol(await getBoardCol());
        let progressChoice: string[] = await getProgressChoice(props.id);
        setProgressChoice(progressChoice);
        let priorityChoice: string[] = await getPriorityChoice(props.id);
        setPriorityChoice(priorityChoice);
    });
    };
    onMount(setup);
    
    createEffect(() => {
        let tempgroup = [];
        for (var x in entities) { if (entities[x].type == "group") {tempgroup.push(entities[x]); nextID+=1; nextOrder+=1; }};
        setGroupCount(tempgroup);
    }, [entities])

    return (
        <>
            <div class="grid grid-cols-1 md:grid-cols-3 p-2 text-left gap-6">
                <div class="my-2 p-2 bg-gray-100 shadow-lg border-gray-400 rounded-md">
                  <p class="text-xl underline font-bold">Edit current groups:</p>
                  <p class="my-1">Please note these can be ordered by drag&drop within the board section.</p>
                    <div class="grid grid-cols-1">
                      <For each={groupCount()}>{(group) =>
                        <>
                          <div class="grid grid-cols-12 gap-2">
                            <input value={group.name} class="input my-1 col-span-11 rounded-lg"
                            onchange={(e)=> {setEntities(group.id, "name", e.target.value); saveEntities(entities, props.id);}} />
                            <button class="w-full rounded-lg my-1 col-span-1" onclick={async () => {
                              let removeid: number = 99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999;
                              for (var x in entities) {
                                if (group == entities[x]) {
                                  removeid = parseInt(x);
                                }
                              }
                              await removeGroup(removeid, Cookies.get("auth")!);
                              location.reload();
                            }}>
                              <svg viewBox="0 0 24 24" class="m-auto w-6" fill="black" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.73708 6.54391V18.9857C5.73708 19.7449 6.35257 20.3604 7.11182 20.3604H16.8893C17.6485 20.3604 18.264 19.7449 18.264 18.9857V6.54391M2.90906 6.54391H21.0909" stroke="#1C1C1C" stroke-width="1.7" stroke-linecap="round"></path> <path d="M8 6V4.41421C8 3.63317 8.63317 3 9.41421 3H14.5858C15.3668 3 16 3.63317 16 4.41421V6" stroke="#1C1C1C" stroke-width="1.7" stroke-linecap="round"></path> </g></svg>
                            </button>
                          </div>
                        </>
                      }</For>
                    </div>
                    <button
                      class="text-3xl my-4 font-bold w-full rounded-lg hover:bg-sky-700 bg-sky-800 text-white py-0.5"
                      onClick={()=> {
                        let newid = nextID += 1;
                        let ordernum = nextOrder += 1;
                        addGroup(newid, "New Group", ordernum.toString(), setEntities);
                        saveEntities(entities, props.id);
                    }}>
                      +
                    </button>
                </div>
                <div class="my-2 p-2 bg-gray-100 shadow-lg border-gray-400 rounded-md">
                  <p class="text-xl underline font-bold">Edit progress options:</p>
                    <p class="my-1">Please note for tasks to be registed as "Completed" a progress option with that name must exist.</p>
                    <div class="grid grid-cols-1">
                      <For each={progressChoice()}>{(progress, id) =>
                        <>
                          <div class="grid grid-cols-12 gap-2">
                            <input value={progress.name} class="input my-1 col-span-9 rounded-lg"
                            onchange={(e)=> {let current = progressChoice(); current[id()].name = e.target.value; setProgressChoice(current); UpdateProgressChoice(progressChoice(), props.id)}} />
                            <input type="color" class="rounded-full col-span-2 w-full h-8 m-auto" value={progress.colour}
                            onchange={(e)=> {let current = progressChoice(); current[id()].colour = e.target.value; setProgressChoice(current); UpdateProgressChoice(progressChoice(), props.id)}} />
                            <button class="w-full rounded-lg my-1 col-span-1" onclick={async () => {
                              if (progressChoice().length > 1) {
                                setProgressChoice([...progressChoice().slice(0, id()), ...progressChoice().slice(id() + 1)]); UpdateProgressChoice(progressChoice(), props.id)
                              } else {
                                setProgressChoice([]); UpdateProgressChoice(progressChoice(), props.id);
                              }
                            }}>
                              <svg viewBox="0 0 24 24" class="m-auto w-6" fill="black" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.73708 6.54391V18.9857C5.73708 19.7449 6.35257 20.3604 7.11182 20.3604H16.8893C17.6485 20.3604 18.264 19.7449 18.264 18.9857V6.54391M2.90906 6.54391H21.0909" stroke="#1C1C1C" stroke-width="1.7" stroke-linecap="round"></path> <path d="M8 6V4.41421C8 3.63317 8.63317 3 9.41421 3H14.5858C15.3668 3 16 3.63317 16 4.41421V6" stroke="#1C1C1C" stroke-width="1.7" stroke-linecap="round"></path> </g></svg>
                            </button>
                          </div>
                        </>
                      }</For>
                    </div>
                    <button
                      class="text-3xl my-4 font-bold w-full rounded-lg hover:bg-sky-700 bg-sky-800 text-white py-0.5"
                      onClick={()=> {
                        setProgressChoice((prevChoices) => [...prevChoices, ...[{name: "Progress", colour: "#e66465"}]]); UpdateProgressChoice(progressChoice(), props.id)
                    }}>
                      +
                    </button>
                </div>
                <div class="my-2 p-2 bg-gray-100 shadow-lg border-gray-400 rounded-md">
                  <p class="text-xl underline font-bold">Edit priority options:</p>
                    <div class="grid grid-cols-1">
                      <For each={priorityChoice()}>{(progress, id) =>
                        <>
                          <div class="grid grid-cols-12 gap-2">
                            <input value={progress.name} class="input my-1 col-span-9 rounded-lg"
                            onchange={(e)=> {let current = priorityChoice(); current[id()].name = e.target.value; setPriorityChoice(current); UpdatePriorityChoice(priorityChoice(), props.id)}} />
                            <input type="color" class="rounded-full col-span-2 w-full h-8 m-auto" value={progress.colour}
                            onchange={(e)=> {let current = priorityChoice(); current[id()].colour = e.target.value; setPriorityChoice(current); UpdatePriorityChoice(priorityChoice(), props.id)}} />
                            <button class="w-full rounded-lg my-1 col-span-1" onclick={async () => {
                              if (priorityChoice().length > 1) {
                                setPriorityChoice([...priorityChoice().slice(0, id()), ...priorityChoice().slice(id() + 1)]); UpdatePriorityChoice(priorityChoice(), props.id)
                              } else {
                                setPriorityChoice([]); UpdatePriorityChoice(priorityChoice(), props.id);
                              }
                            }}>
                              <svg viewBox="0 0 24 24" class="m-auto w-6" fill="black" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.73708 6.54391V18.9857C5.73708 19.7449 6.35257 20.3604 7.11182 20.3604H16.8893C17.6485 20.3604 18.264 19.7449 18.264 18.9857V6.54391M2.90906 6.54391H21.0909" stroke="#1C1C1C" stroke-width="1.7" stroke-linecap="round"></path> <path d="M8 6V4.41421C8 3.63317 8.63317 3 9.41421 3H14.5858C15.3668 3 16 3.63317 16 4.41421V6" stroke="#1C1C1C" stroke-width="1.7" stroke-linecap="round"></path> </g></svg>
                            </button>
                          </div>
                        </>
                      }</For>
                    </div>
                    <button
                      class="text-3xl my-4 font-bold w-full rounded-lg hover:bg-sky-700 bg-sky-800 text-white py-0.5"
                      onClick={()=> {
                        setPriorityChoice((prevChoices) => [...prevChoices, ...[{name: "Priority", colour: "#e66465"}]]); UpdatePriorityChoice(priorityChoice(), props.id)
                    }}>
                      +
                    </button>
                </div>
                {/* <div class="my-2 p-2 bg-gray-100 shadow-lg border-gray-400 rounded-md">
                  <p class="text-xl underline font-bold mb-2">Board column amount:</p>
                  <div class="flex items-center">
                    <button
                      class="bg-sky-800 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-l"
                      onClick={decrement}
                    >
                      -
                    </button>
                    <p class="text-2xl bg-white px-6 py-1 rounded-md">{boardcol()}</p>
                    <button
                      class="bg-sky-800 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-r"
                      onClick={increment}
                    >
                      +
                    </button>
                  </div>
                </div> */}
            </div>
        </>
    );
};


export const getBoardCol = async (plannerid: number) => {
  const getBoardCol = server$(async (token:string|undefined, plannerid: number) => {
      const auth_checked = await getAuth(token);
      if (auth_checked.loggedin == true) {
        const userplanner = await db.select().from(planner).where(eq(planner.id, plannerid));
      return userplanner;
      } else {
        return [];
      }
  })
  const boardcolnum = await getBoardCol(Cookies.get("auth"), plannerid);
  let boardcol: number = 4;
  boardcolnum.map(settings => boardcol = settings.boardcol);
  return boardcol;
};

export const UpdateBoardCol = async (newnum: number, plannerid: number) => {
  const UpdateBoardCol = server$(async (token:string|undefined, newnum: number, plannerid: number) => {
      const auth_checked = await getAuth(token);
      if (auth_checked.loggedin == true) {
        const updateboardcol = await db.update(planner).set({boardcol: newnum}).where(eq(planner.id, plannerid));
      }
  })
  const boardcolnum = await UpdateBoardCol(Cookies.get("auth"), newnum, plannerid);
};
