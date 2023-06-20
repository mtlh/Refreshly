import { eq } from "drizzle-orm";
import Cookies from "js-cookie";
import { customise } from "~/db/schema";
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

export const ORDER_DELTA = 1;
export const ID_DELTA = 1;

export const PlannerOptions = () => {
    let nextOrder = 1;
    let nextID = 1;

    const [entities, setEntities] = createStore<Record<Id, Entity>>({});

    const [boardcol, SetBoardCol] = createSignal(0);
    const increment = () => {UpdateBoardCol(boardcol() + 1); SetBoardCol(boardcol() + 1)};
    const decrement = () => {UpdateBoardCol(boardcol() - 1); SetBoardCol(boardcol() - 1)};

    const setup = () => {
    batch(async () => {
        let ent = await getEntities(nextID, nextOrder, entities, setEntities); nextID = ent.nextID; nextOrder = ent.nextOrder;
        SetBoardCol(await getBoardCol());
    });
    };
    onMount(setup);

    const [groupCount, setGroupCount] = createSignal(new Array());
    createEffect(() => {
        let tempgroup = [];
        for (var x in entities) { if (entities[x].type == "group") {tempgroup.push(entities[x]); nextID+=1; nextOrder+=1; }};
        setGroupCount(tempgroup);
    }, [entities])
    return (
        <>
            <div class="grid grid-cols-2 p-2 text-left gap-6">
                <div class="my-2 p-2 bg-gray-100 shadow-lg border-gray-400 rounded-md">
                  <p class="text-xl underline font-bold">Edit current groups:</p>
                  <p>Please note these can be ordered by drag&drop within the board section.</p>
                    <div class="grid grid-cols-1">
                      <For each={groupCount()}>{(group) =>
                        <>
                          <div class="grid grid-cols-6 gap-2">
                            <input value={group.name} class="input my-1 col-span-5 rounded-lg"
                            onchange={(e)=> {setEntities(group.id, "name", e.target.value); saveEntities(entities);}} />
                            <button class="bg-red-500 w-full rounded-lg my-1 col-span-1" onclick={async () => {
                              let removeid: number = 99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999;
                              for (var x in entities) {
                                if (group == entities[x]) {
                                  removeid = parseInt(x);
                                }
                              }
                              await removeGroup(removeid, Cookies.get("auth")!);
                              location.href = "/planner?options=true";
                            }}>
                              <svg viewBox="0 0 24 24" class="m-auto w-6" fill="white" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.73708 6.54391V18.9857C5.73708 19.7449 6.35257 20.3604 7.11182 20.3604H16.8893C17.6485 20.3604 18.264 19.7449 18.264 18.9857V6.54391M2.90906 6.54391H21.0909" stroke="#1C1C1C" stroke-width="1.7" stroke-linecap="round"></path> <path d="M8 6V4.41421C8 3.63317 8.63317 3 9.41421 3H14.5858C15.3668 3 16 3.63317 16 4.41421V6" stroke="#1C1C1C" stroke-width="1.7" stroke-linecap="round"></path> </g></svg>
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
                        saveEntities(entities);
                    }}>
                      +
                    </button>
                </div>
                <div class="my-2 p-2 bg-gray-100 shadow-lg border-gray-400 rounded-md">
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
