import {
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
  SortableProvider,
  createSortable,
  closestCenter,
  maybeTransformStyle,
  Id,
  DragEventHandler,
  Draggable,
  Droppable,
  CollisionDetector,
  useDragDropContext,
} from "@thisbeyond/solid-dnd";
import { batch, createEffect, createSignal, For, JSX, onMount, VoidComponent} from "solid-js";
import { createStore, produce } from "solid-js/store";
import Big from "big.js";
import Cookies from "js-cookie";
import server$ from "solid-start/server";
import { getAuth } from "~/functions/getAuth";
import { db } from "~/functions/db_client";
import { and, eq } from "drizzle-orm";
import { planner } from "~/db/schema";
import moment from "moment";
import { getBoardCol } from "./PlannerOptions";
import { Entity, Item, ORDER_DELTA, checklist } from "~/types_const/planner";
import { addGroup, addItem } from "~/functions/planner/addItemGroup";
import { saveEntities } from "~/functions/planner/saveEntities";
import { getEntities } from "~/functions/planner/getEntities";
import { UpdateGroupShowFilter, getGroupShowFilter } from "~/functions/planner/filterGroupShow";
import { GetPreview, LoadPreview, SavePreview } from "~/functions/uploads/LinkPreview";
import { LoadFiles, SaveFiles, convertToBlob, parseFile } from "~/functions/uploads/FileUpload";
import { getProgressChoice } from "~/functions/planner/progressChoice";
import { getPriorityChoice } from "~/functions/planner/priorityChoice";

const sortByOrder = (entities: Entity[]) => {
  const sorted = entities.map((item) => ({ order: new Big(item.order), item }));
  sorted.sort((a, b) => a.order.cmp(b.order));
  return sorted.map((entry) => entry.item);
};

const ItemOverlay = (props: Item) => {
  return <div class="sortable"></div>;
};

const GroupOverlay: VoidComponent<{ name: string; items: Item[] }> = (
  props
) => {
  return (
    <div>
      <div class="column-header text-2xl mb-2">{props.name}</div>
      <div class="column cursor-move">
        <For each={props.items}>
          {(item) => <ItemOverlay {...item} />}
        </For>
      </div>
    </div>
  );
};

export const PlannerBoard = (props: { type: string; }) => {
  const [entities, setEntities] = createStore<Record<Id, Entity>>({});

  let nextOrder = 1;
  let nextID = 1;

  const Item = (item: Item) => {
    const sortable = createSortable(item.id, {
      type: "item",
      group: item.group,
    });
    const [checkedcount, setCheckedCount] = createSignal(0);
    const [itemstore, setItemStore] = createStore(item);
    createEffect(() => {
      let count = 0;
      for (var x in itemstore.checklist) { if (itemstore.checklist[x].checked) {count += 1; }};
      setCheckedCount(count);
    }, [itemstore.checklist])
    const createIdsArray = (items: checklist[]): number[] => {
      return items.map((item, index) => index);
    };
    let startidarray: number[] = [];
    if (itemstore.checklist != null && itemstore.checklist != undefined) {
      startidarray = createIdsArray(itemstore.checklist);
    }
    const [items, setItems] = createSignal(startidarray);
    const [activeItem, setActiveItem] = createSignal(null);
    const ids = () => items();
    const ChecklistonDragStart = ({ draggable }: any) => setActiveItem(null);
    const ChecklistonDragEnd = ({ draggable, droppable }: any) => {
      if (draggable && droppable) {
        const currentItems = ids();
        const fromIndex = currentItems.indexOf(draggable.id);
        const toIndex = currentItems.indexOf(droppable.id);
        if (fromIndex !== toIndex) {
          const updatedItems = currentItems.slice();
          updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
          setItems(updatedItems);
          const rearrangeItemsArray = (items: checklist[], ids: number[]): checklist[] => {
            return ids.map(id => items[id]);
          };
          const rearrange = rearrangeItemsArray(itemstore.checklist, updatedItems);
          setItemStore("checklist", rearrange);
          setItemStore("lastupdate", new Date());
          setEntities(itemstore.id, itemstore);
          setItems(createIdsArray(itemstore.checklist));
          saveEntities(entities);
        }
      }
  };
  const Sortable = (props: any) => {
    const sortable = createSortable(props.item);
    const [state] = useDragDropContext();
    return (
      <div class="grid grid-cols-12 sortable mr-2" use:sortable classList={{"opacity-80": sortable.isActiveDraggable, "transition-transform": !!state.active.draggable}}>
        <div class="col-span-1 m-auto">
          {itemstore.checklist[props.item].checked ?
            <button onclick={() => {setItemStore("checklist", props.item, {checked: !itemstore.checklist[props.item].checked, content: itemstore.checklist[props.item].content}); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities(entities)}}>
              <svg fill="#000000" version="1.1" class="m-auto w-5" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <polygon points="452.253,28.326 197.831,394.674 29.044,256.875 0,292.469 207.253,461.674 490,54.528 "></polygon> </g></svg>
            </button>
            :
            <button onclick={() => {setItemStore("checklist", props.item, {checked: !itemstore.checklist[props.item].checked, content: itemstore.checklist[props.item].content}); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities(entities)}}>
              <svg fill="#000000" class="m-auto w-5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M0 14.545L1.455 16 8 9.455 14.545 16 16 14.545 9.455 8 16 1.455 14.545 0 8 6.545 1.455 0 0 1.455 6.545 8z" fill-rule="evenodd"></path> </g></svg>
            </button>
          }
        </div>
        <input
          class="input my-1 w-full text-sm col-span-10 m-auto"
          value={itemstore.checklist[props.item].content}
          onchange={(e)=> {setItemStore("checklist", props.item, {checked: itemstore.checklist[props.item].checked, content: e.target.value}); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities(entities) }}
        />
        <div class="col-span-1 m-auto rounded-lg">
            <button onclick={() => {
              let removedarr = [];
              for (var x in itemstore.checklist) {
                if ((itemstore.checklist[x].content != itemstore.checklist[props.item].content) || (itemstore.checklist[x].checked != itemstore.checklist[props.item].checked)) {
                  removedarr.push(itemstore.checklist[x]);
                }
              }
              setItems(createIdsArray(removedarr)); setItemStore("checklist", removedarr); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities(entities);}}>
              <svg viewBox="0 0 24 24" class="m-auto w-5" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.73708 6.54391V18.9857C5.73708 19.7449 6.35257 20.3604 7.11182 20.3604H16.8893C17.6485 20.3604 18.264 19.7449 18.264 18.9857V6.54391M2.90906 6.54391H21.0909" stroke="#1C1C1C" stroke-width="1.7" stroke-linecap="round"></path> <path d="M8 6V4.41421C8 3.63317 8.63317 3 9.41421 3H14.5858C15.3668 3 16 3.63317 16 4.41421V6" stroke="#1C1C1C" stroke-width="1.7" stroke-linecap="round"></path> </g></svg>
            </button>
        </div>
      </div>
    );
  };
  const [isdueclass, setIsDueClass] = createSignal(" bg-transparent ");
  createEffect(() => {
    if (moment(itemstore.duedate).isBefore(moment(new Date())) == true) {
      setIsDueClass(" text-white bg-red-500 ")
    } else { 
      setIsDueClass(" bg-transparent ")
    }
  }, [itemstore.duedate]);

  const [files, setFiles] = createSignal<File[]>([]);

  const handleFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      await SaveFiles(await convertToBlob(files()), Cookies.get("auth")!, itemstore.id)
    }
  };

  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRemove = async (file: File) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    await SaveFiles(await convertToBlob(files()), Cookies.get("auth")!, itemstore.id)
  };

  const [links, setLinks] = createSignal([]);

  async function handleAddLink(event: any) {
    event.preventDefault();
    const inputValue = event.target.elements.link.value.trim();
    if (inputValue != "") {
      const resultpreview = await GetPreview(Cookies.get("auth")!, inputValue);
      // @ts-ignore
      setLinks(prevLinks => [...prevLinks, resultpreview]);
      await SavePreview(Cookies.get("auth")!, links(), itemstore.id)
    }
  }
  async function handleRemoveLink(index: number) {
    setLinks((prevLinks) => prevLinks.filter((_, i) => i !== index));
    await SavePreview(Cookies.get("auth")!, links(), itemstore.id)
  }

  createEffect(async () => {
    // Previews
    let load = await LoadPreview(Cookies.get("auth")!, itemstore.id);
    if (load != null) {
      setLinks(load);
    }
    // Files
    let filesarr = await LoadFiles(Cookies.get("auth")!, itemstore.id)
    filesarr.forEach((element: string) => {
      // @ts-ignore
      const file: File = parseFile(element);
      setFiles((prevFiles) => [...prevFiles, ...[file]]);
    });
  })

  return (
      <>
        <label
          for={itemstore.id.toString()}
        >
          <div
          use:sortable
          class="sortable bg-gray-100 rounded-lg p-1 text-left ring-1 ring-gray-300 shadow-sm container hover:shadow-2xl w-[92%] m-2"
          classList={{ "opacity-25": sortable.isActiveDraggable }}
          >
            <p class="text-lg text-black w-full py-0.5 px-2.5 font-bold">{itemstore.name}</p>
            <For each={progressChoice()}>
              {(progress) => (
                <>
                  {itemstore.progress == progress.name &&
                    <p class={`text-white text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md mx-2 my-1`} style={{background: progress.colour}}>{progress.name}</p>
                  }
                </>
              )}
            </For>
            <For each={priorityChoice()}>
              {(priority) => (
                <>
                  {itemstore.priority == priority.name &&
                    <p class={`text-white text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md mx-2 my-1`} style={{background: priority.colour}}>{priority.name}</p>
                  }
                </>
              )}
            </For>
            <p class="text-sm text-black w-full py-0.5 px-2.5 mb-8 mt-1">{itemstore.description}</p>
            <div class="relative">
              {itemstore.checklist &&
                <p class="absolute bottom-0 right-0 text-right py-0.5 px-2.5 italic text-sm">{checkedcount()}/{itemstore.checklist.length}</p>
              }
              <input type="date" class={"py-0.5 px-2.5 absolute italic bottom-0 left-0 text-sm border-0 rounded-lg w-[7.5rem] focus:ring-sky-800 focus:ring-2" + isdueclass()} value={itemstore.duedate} onChange={(e) => {setItemStore("duedate", e.target.value); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities(entities)}} />
            </div>
          </div>
        </label>
        <input type="checkbox" id={itemstore.id.toString()} class="modal-toggle" />
        <label for={itemstore.id.toString()} class="modal cursor-pointer z-50">
          <label class="modal-box relative rounded-lg w-full h-full" for="">
            <input class="py-1 w-full text-lg font-bold" value={itemstore.name} onChange={(e) => {setItemStore("name", e.target.value); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities(entities)}}/>
            <p class="py-1 text-left italic font-light">Last updated: {moment(itemstore.lastupdate).format("HH:mm DD-MM-YYYY")}</p>
            <div class="grid grid-cols-2">
              <div class="form-control w-full my-1 m-auto">
                <label class="label">
                  <span class="label-text">Startdate:</span>
                </label>
                <input type="date" class="input" value={itemstore.startdate} onChange={(e) => {setItemStore("startdate", e.target.value); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities(entities)}} />
              </div>
              <div class="form-control w-full my-1 m-auto">
                <label class="label">
                  <span class="label-text">Duedate:</span>
                </label>
                <input type="date" class="input" value={itemstore.duedate} onChange={(e) => {setItemStore("duedate", e.target.value); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities(entities)}} />
              </div>
              <div class="form-control w-full my-1 m-auto">
                <label class="label">
                  <span class="label-text">Progress:</span>
                </label>
                <select class="select" value={itemstore.progress} onChange={(e) => {setItemStore("progress", e.target.value); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities(entities)}}>
                  <option>{itemstore.progress}</option>
                  <For each={progressChoice()}>
                    {(progress) => (
                      <>
                        {itemstore.progress != progress.name &&
                          <option>{progress.name}</option>
                        }
                     </>
                    )}
                  </For>
                </select>
              </div>
              <div class="form-control w-full my-1 m-auto">
                <label class="label">
                  <span class="label-text">Priority:</span>
                </label>
                <select class="select" value={itemstore.priority} onChange={(e) => {setItemStore("priority", e.target.value); setEntities(itemstore.id, itemstore); saveEntities(entities)}}>
                  <option>{itemstore.priority}</option>
                  <For each={priorityChoice()}>
                    {(priority) => (
                      <>
                        {itemstore.priority != priority.name &&
                          <option>{priority.name}</option>
                        }
                     </>
                    )}
                  </For>
                </select>
              </div>
            </div>
            <div class="form-control w-full my-1 m-auto">
              <label class="label">
                <span class="label-text">Description:</span>
              </label>
              <textarea class="textarea textarea-bordered h-full rounded-lg" value={itemstore.description} onChange={(e) => {setItemStore("description", e.target.value); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities(entities)}}></textarea>
            </div>
            <div class="form-control w-full my-1 m-auto">
              <label class="label">
                <span class="label-text">Checklist:</span>
              </label>
              <ul>
                <DragDropProvider
                  onDragStart={ChecklistonDragStart}
                  onDragEnd={ChecklistonDragEnd}
                  collisionDetector={closestCenter}
                >
                  <DragDropSensors />
                  <div class="column self-stretch">
                    <SortableProvider ids={ids()}>
                      <For each={items()}>{(item) => <Sortable item={item} />}</For>
                    </SortableProvider>
                  </div>
                  <DragOverlay>
                    <div class="sortable">{activeItem()}</div>
                  </DragOverlay>
                </DragDropProvider>
                <button onClick={() => {try {setItemStore("checklist", l => [...l, {checked: false, content: "new checklist"}])}catch{setItemStore("checklist", [{checked: false, content: "new checklist"}])}; setItems(createIdsArray(itemstore.checklist)); setItems(createIdsArray(itemstore.checklist)); setItemStore("lastupdate", new Date()); setEntities(itemstore.id, itemstore); saveEntities(entities)}} 
                  class="bg-grey-100 text-2xl rounded-sm w-[95%] text-black p-1 my-1 hover:ring-2 m-auto">
                  +
                </button>
              </ul>
            </div>
            <div class="form-control w-full my-1 m-auto">
              <label class="label">
                <span class="label-text">Upload Files:</span>
              </label>
              {files().length > 0 && (
                  <div class="mb-2">
                    {files().map((file, index) => (
                        <>
                          {/* @ts-ignore */}
                          <li class="text-gray-500 items-center grid grid-cols-12" key={index}>
                            <span class="mr-2 col-span-10 text-left">{file.name}</span>
                            <button class="w-6 h-6" onClick={() => {handleDownload(file)}}>
                              <svg viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.163 2.819C9 3.139 9 3.559 9 4.4V11H7.803c-.883 0-1.325 0-1.534.176a.75.75 0 0 0-.266.62c.017.274.322.593.931 1.232l4.198 4.401c.302.318.453.476.63.535a.749.749 0 0 0 .476 0c.177-.059.328-.217.63-.535l4.198-4.4c.61-.64.914-.96.93-1.233a.75.75 0 0 0-.265-.62C17.522 11 17.081 11 16.197 11H15V4.4c0-.84 0-1.26-.164-1.581a1.5 1.5 0 0 0-.655-.656C13.861 2 13.441 2 12.6 2h-1.2c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656zM5 21a1 1 0 0 0 1 1h12a1 1 0 1 0 0-2H6a1 1 0 0 0-1 1z" fill="black"></path></g></svg>
                            </button>
                            <button class="ml-2 w-6 h-6" onClick={() => {handleRemove(file)}}>
                                <svg fill="black" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>cross-round</title> <path d="M0 16q0 3.264 1.28 6.208t3.392 5.12 5.12 3.424 6.208 1.248 6.208-1.248 5.12-3.424 3.392-5.12 1.28-6.208-1.28-6.208-3.392-5.12-5.088-3.392-6.24-1.28q-3.264 0-6.208 1.28t-5.12 3.392-3.392 5.12-1.28 6.208zM4 16q0-3.264 1.6-6.016t4.384-4.352 6.016-1.632 6.016 1.632 4.384 4.352 1.6 6.016-1.6 6.048-4.384 4.352-6.016 1.6-6.016-1.6-4.384-4.352-1.6-6.048zM9.76 20.256q0 0.832 0.576 1.408t1.44 0.608 1.408-0.608l2.816-2.816 2.816 2.816q0.576 0.608 1.408 0.608t1.44-0.608 0.576-1.408-0.576-1.408l-2.848-2.848 2.848-2.816q0.576-0.576 0.576-1.408t-0.576-1.408-1.44-0.608-1.408 0.608l-2.816 2.816-2.816-2.816q-0.576-0.608-1.408-0.608t-1.44 0.608-0.576 1.408 0.576 1.408l2.848 2.816-2.848 2.848q-0.576 0.576-0.576 1.408z"></path> </g></svg>
                            </button>
                          </li>
                        </>
                      ))}
                  </div>
              )}
              <div class="flex items-center justify-center w-full">
                  <label class="flex flex-col items-center justify-center w-full h-16 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                      <div class="flex flex-col items-center justify-center pt-2 pb-2">
                          <svg aria-hidden="true" class="w-8 h-8 mt-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                          <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span></p>
                      </div>
                      <input type="file" class="hidden mb-4" multiple onChange={handleFileChange}  />
                  </label>
              </div>
            </div>
            <div class="form-control w-full my-1 m-auto">
              <label class="label">
                <span class="label-text">External Links:</span>
              </label>
              <div class="grid grid-cols-2 gap-4 my-1">
                {links().map((link, index) => (
                  <div class="h-52 max-w-lg flex gap-4 relative bg-gray-200 border border-gray-300 rounded-lg shadow-lg">
                    <button onClick={() => handleRemoveLink(index)} class="absolute top-0 right-0 h-10 w-10 bg-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="black"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        class="remove-icon"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.images[0] ?
                      <img class="rounded-t-lg max-h-28" src={link.images[0]} alt="Preview Thumb Image" />
                      :
                      <>
                        <br />
                        <br />
                        <br />
                      </>
                      }
                      <div class="p-1 text-left">
                          <h5 class="mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white">{link.title}</h5>
                          <p class="mb-1 font-normal text-gray-700 dark:text-gray-400 text-xs">{link.description}</p>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddLink} class="grid grid-cols-4 gap-2 my-1">
                <input type="text" name="link" placeholder="Enter a link" class="input col-span-3 border border-gray-200 rounded-lg" />
                <button type="submit" class="bg-gray-200 rounded-sm hover:bg-gray-300">Add Link</button>
              </form>
            </div>
            
            <button onclick={() => deletetask(itemstore.id)} class="py-1 my-2 w-full bg-red-500 text-white rounded-lg hover:bg-red-700">DELETE TASK</button>
          </label>
        </label>
      </>
    );
  };

  const deletetask = async (itemid: number) => {
    const DeleteFromPlanner = server$(async (removeid: number, entities: Entity[], token:string|undefined) => {
      const auth_checked = await getAuth(token);
      let newarr = [];
      if (auth_checked.loggedin == true) {
        for (var x in entities) {
          if (entities[x].id == removeid) {
            await db.delete(planner).where(and(eq(planner.id, entities[x].id), eq(planner.username, auth_checked.user.username)));
          } else {
            newarr.push(entities[x]);
          }
        }
      }
      return newarr;
    })
    const newarr = await DeleteFromPlanner(itemid, entities, Cookies.get("auth"));
    location.href = "/planner?" + props.type + "=true"; 
  }

  const Group: VoidComponent<{ id: Id; name: string; items: Item[]}> = (
    props
  ) => {
    const sortable = createSortable(props.id, { type: "group" });
    const sortedItemIds = () => props.items.map((item) => item.id);
    const [isOpen, setIsOpen] = createSignal(false);
    const toggleDropdown = () => {
      setIsOpen(!isOpen());
    };
    const [completed_count, setCompletedCount] = createSignal(0);
    createEffect(() => {
      setCompletedCount(props.items.filter(item => item.progress === 'Completed').length);
    });
    return (
      <div
        ref={sortable.ref}
        style={maybeTransformStyle(sortable.transform)}
        classList={{ "opacity-25": sortable.isActiveDraggable }}
      >
        <div class={"column-header text-2xl mb-2 text-left p-2"} {...sortable.dragActivators}>
          {props.name}
        </div>
        <div class="column cursor-move overflow-y-auto" style={{ "max-height": "60vh" }}>
          <SortableProvider ids={sortedItemIds()}>
            <For each={props.items}>
              {(item) => (
                <>
                  { item.progress != "Completed" &&
                    <Item {...item} />
                  }
                </>
              )}
            </For>
          </SortableProvider>
        </div>
        <button onClick={()=> {addItem({
          name: "new task",
          type: "item",
          group: props.id,
          progress: "",
          description: "",
          checklist: [],
          priority: "",
          lastupdate: new Date(),
          id: nextID+=1,
          order: (nextOrder+=1).toString()
        }, setEntities); saveEntities(entities)}} class="bg-grey-100 text-2xl rounded-sm w-[95%] text-black p-1 hover:ring-2 m-auto">+</button>
        <div class="relative mt-2">
          <button
            class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-sm w-[95%] focus:outline-none focus:bg-gray-300 m-auto"
            onClick={toggleDropdown}
          >
            Completed - 
            {completed_count()}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class={`ml-2 w-4 h-4 transition-transform duration-300 ${
                isOpen() ? "transform rotate-180" : ""
              }`}
            >
              <path
                fill-rule="evenodd"
                d="M5.293 6.293a1 1 0 0 1 1.414 0L10 9.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          {isOpen() && (
            <div class="absolute z-40 w-full mt-2 rounded-lg overflow-y-auto" style={{"max-height":"60vh"}}>
              <div class="column cursor-move">
                <SortableProvider ids={sortedItemIds()}>
                  <For each={props.items}>
                    {(item) => (
                      <>
                        { item.progress == "Completed" &&
                          <Item {...item} />
                        }
                      </>
                    )}
                  </For>
                </SortableProvider>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // const getEntities = async () => {
  //   const getAllEntities = server$(async (token:string|undefined) => {
  //     const auth_checked = await getAuth(token);
  //     if (auth_checked.loggedin == true) {
  //       const userplanner = await db.select().from(planner).where(eq(planner.username, auth_checked.user.username));
  //       return userplanner;
  //     } else {
  //       return [];
  //     }
  //   })
  //   const planneritems = await getAllEntities(Cookies.get("auth"));
  //   if (planneritems?.length == 0) {
  //     addGroup(nextID+=1, "Upcoming", (nextOrder+=1).toString(), setEntities);
  //     addGroup(nextID+=1, "Ongoing", (nextOrder+=1).toString(), setEntities);
  //     addGroup(nextID+=1, "Completed", (nextOrder+=1).toString(), setEntities);
  //   } else {
  //     for (var entity of planneritems) {
  //       if (entity.type == "item") {
  //         addItem({
  //           id: entity.id, 
  //           order: entity.ordernum!, 
  //           name: entity.name!, 
  //           group: entity.groupid!, 
  //           type: "item",
  //           startdate: entity.startdate!,
  //           duedate: entity.duedate!, 
  //           progress: entity.progress!, 
  //           description: entity.description!, 
  //           checklist: JSON.parse(entity.checklist!),
  //           priority: entity.priority!, 
  //           lastupdate: entity.lastupdate}, setEntities)
  //       } else {
  //         addGroup(entity.id, entity.name!, entity.ordernum!, setEntities)
  //       }
  //       if (entity.id >= nextID) {
  //         nextID = (entity.id + 1); 
  //       }
  //       nextOrder += 1;
  //     }
  //   }
  // }

  const groups = () =>
    sortByOrder(
      Object.values(entities).filter((item) => item.type === "group")
    ) as Group[];

  const [boardcol, SetBoardCol] = createSignal(0);
  const [groupfilter, SetGroupFilter] = createSignal(Array.from({length: groups().length}, () => true));

  const [progressChoice, setProgressChoice] = createSignal(0);
  const [priorityChoice, setPriorityChoice] = createSignal(0);

  function updateGroupFilterAtIndex(index: number, newValue: boolean) {
    SetGroupFilter(produce((draft) => {
      draft[index] = newValue;
    }));
  }

  const setup = () => {
    batch(async () => {
      let ent = await getEntities(nextID, nextOrder, entities, setEntities); nextID = ent.nextID; nextOrder = ent.nextOrder;

      SetGroupFilter(await getGroupShowFilter());

      SetBoardCol(await getBoardCol());

      // Progress/Priority Options
      let priority: string[] = await getPriorityChoice();
      // @ts-ignore
      setPriorityChoice(priority);
      let progress: string[] = await getProgressChoice();
      // @ts-ignore
      setProgressChoice(progress);
    });
  };

  onMount(setup);

  const groupIds = () => groups().map((group) => group.id);

  const groupOrders = () => groups().map((group) => group.order);

  const groupItems = (groupId: Id) =>
    sortByOrder(
      Object.values(entities).filter(
        (entity) => entity.type === "item" && entity.group === groupId
      )
    ) as Item[];

  const groupItemIds = (groupId: Id) =>
    groupItems(groupId).map((item) => item.id);

  const groupItemOrders = (groupId: Id) =>
    groupItems(groupId).map((item) => item.order);

  const isSortableGroup = (sortable: Draggable | Droppable) =>
    sortable.data.type === "group";

  const closestEntity: CollisionDetector = (draggable, droppables, context) => {
    const closestGroup = closestCenter(
      draggable,
      droppables.filter((droppable) => isSortableGroup(droppable)),
      context
    );
    if (isSortableGroup(draggable)) {
      return closestGroup;
    } else if (closestGroup) {
      const closestItem = closestCenter(
        draggable,
        droppables.filter(
          (droppable) =>
            !isSortableGroup(droppable) &&
            droppable.data.group === closestGroup.id
        ),
        context
      );

      if (!closestItem) {
        return closestGroup;
      }

      const changingGroup = draggable.data.group !== closestGroup.id;
      if (changingGroup) {
        const belowLastItem =
          groupItemIds(closestGroup.id).at(-1) === closestItem.id &&
          draggable.transformed.center.y > closestItem.transformed.center.y;

        if (belowLastItem) return closestGroup;
      }

      return closestItem;
    }
  };

  const move = (
    draggable: Draggable,
    droppable: Droppable,
    onlyWhenChangingGroup = true
  ) => {
    if (!draggable || !droppable) return;

    const draggableIsGroup = isSortableGroup(draggable);
    const droppableIsGroup = isSortableGroup(droppable);

    const draggableGroupId = draggableIsGroup
      ? draggable.id
      : draggable.data.group;

    const droppableGroupId = droppableIsGroup
      ? droppable.id
      : droppable.data.group;

    if (
      onlyWhenChangingGroup &&
      (draggableIsGroup || draggableGroupId === droppableGroupId)
    ) {
      return;
    }

    let ids, orders, order: Big | undefined;

    if (draggableIsGroup) {
      ids = groupIds();
      orders = groupOrders();
    } else {
      ids = groupItemIds(droppableGroupId);
      orders = groupItemOrders(droppableGroupId);
    }

    if (droppableIsGroup && !draggableIsGroup) {
      order = new Big(orders.at(-1) ?? -ORDER_DELTA).plus(ORDER_DELTA).round();
    } else {
      const draggableIndex = ids.indexOf(draggable.id);
      const droppableIndex = ids.indexOf(droppable.id);
      if (draggableIndex !== droppableIndex) {
        let orderAfter, orderBefore;
        if (draggableIndex === -1 || draggableIndex > droppableIndex) {
          orderBefore = new Big(orders[droppableIndex]);
          orderAfter = new Big(
            orders[droppableIndex - 1] ?? orderBefore.minus(ORDER_DELTA * 2)
          );
        } else {
          orderAfter = new Big(orders[droppableIndex]);
          orderBefore = new Big(
            orders[droppableIndex + 1] ?? orderAfter.plus(ORDER_DELTA * 2)
          );
        }

        if (orderAfter !== undefined && orderBefore !== undefined) {
          order = orderAfter.plus(orderBefore).div(2.0);
          const rounded = order.round();
          if (rounded.gt(orderAfter) && rounded.lt(orderBefore)) {
            order = rounded;
          }
        }
      }
    }

    if (order !== undefined) {
      setEntities(draggable.id, (entity) => ({
        ...entity,
        order: order?.toString(),
        group: droppableGroupId,
      }));
      saveEntities(entities);
    }
  };

  const onDragOver: DragEventHandler = ({ draggable, droppable }) =>
    move(draggable, droppable);

  const onDragEnd: DragEventHandler = ({ draggable, droppable }) =>
    move(draggable, droppable, false);
  
  return (
    <>
      {(boardcol() != 0 && JSON.stringify(groupfilter()[0]) != "" && priorityChoice() != 0 && progressChoice() != 0) ? 
        <>    
          <div class="relative">
            <div class="absolute dropdown dropdown-bottom dropdown-end top-0 right-0 -translate-y-14 z-30">
              <label tabindex="0" class="btn flex text-md md:text-lg bg-gray-100 rounded-lg m-1 text-black hover:bg-gray-200 capitalize border-0">
                Filter
                <svg class="w-6 h-6 ml-2" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 10.5A3.502 3.502 0 0 0 18.355 8H21a1 1 0 1 0 0-2h-2.645a3.502 3.502 0 0 0-6.71 0H3a1 1 0 0 0 0 2h8.645A3.502 3.502 0 0 0 15 10.5zM3 16a1 1 0 1 0 0 2h2.145a3.502 3.502 0 0 0 6.71 0H21a1 1 0 1 0 0-2h-9.145a3.502 3.502 0 0 0-6.71 0H3z" fill="#000000"></path></g></svg>
              </label>
              <div tabindex="0" class="dropdown-content card card-compact w-60 rounded-sm shadow bg-white text-black z-30">
                <div class="card-body">
                  <ul class="p-0 space-y-2 text-lg text-gray-700 dark:text-gray-200" aria-labelledby="dropdownCheckboxButton">
                    <For each={groups()}>
                      {(group, v) => (
                        <>
                          <li>
                            <div class="flex items-center">
                                <input checked={groupfilter()[v()]} onchange={() => { updateGroupFilterAtIndex(v(), !groupfilter()[v()]); UpdateGroupShowFilter(groupfilter()); } } id="checkbox-item-2" type="checkbox" value="" 
                                  class="w-6 h-6 text-sky-800 bg-gray-100 border-gray-300 rounded focus:ring-sky-700"
                                 />
                                <label for="checkbox-item-2" class="ml-1 text-lg font-medium text-gray-900 dark:text-gray-300">{group.name}</label>
                              </div>
                          </li>
                        </>
                      )}
                    </For>
                  </ul>
                  <button onclick={()=> {location.reload()}} class="bg-sky-800 hover:bg-sky-700 text-white rounded-sm m-1 p-2 text-lg">Save</button>
                </div>
              </div>
            </div>
          </div>
          {/* <div class={`grid gap-2 p-2 self-stretch grid-cols-2 md:grid-cols-3 lg:grid-cols-${boardcol()}`}></div> */}
          <div class={`grid gap-2 p-2 self-stretch grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`}>
            <DragDropProvider
              onDragOver={onDragOver}
              onDragEnd={(e)=> {onDragEnd(e); saveEntities(entities)}}
              collisionDetector={closestEntity}
            >
              <DragDropSensors />
                <SortableProvider ids={groupIds()}>
                  <For each={groups()}>
                    {(group, x) => (
                      <>
                        {groupfilter()[x()] == true &&
                          <Group
                            id={group.id}
                          name={group.name}
                          items={groupItems(group.id)}
                          />
                        }
                      </>
                    )}
                  </For>
                </SortableProvider>
              <DragOverlay>
                {(draggable) => {
                  const entity = entities[draggable.id];
                  return isSortableGroup(draggable) ? (
                    <GroupOverlay name={entity.name} items={groupItems(entity.id)} />
                  ) : (
                    <ItemOverlay name={entity.name} />
                  );
                }}
              </DragOverlay>
            </DragDropProvider>
          </div>
        </>
        :
          <div class="">
          </div>
      }
    </>
  );
};