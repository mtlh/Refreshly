import { createSortable, useDragDropContext, DragDropProvider, closestCenter, DragDropSensors, SortableProvider, DragOverlay, Id } from "@thisbeyond/solid-dnd";
import { and, eq } from "drizzle-orm";
import Cookies from "js-cookie";
import moment from "moment";
import { createSignal, createEffect, For } from "solid-js";
import { createStore } from "solid-js/store";
import server$ from "solid-start/server";
import { planner } from "~/db/schema";
import { db } from "~/functions/db_client";
import { getAuth } from "~/functions/getAuth";
import { saveEntities } from "~/functions/planner/saveEntities";
import { SaveFiles, convertToBlob, LoadFiles, parseFile } from "~/functions/uploads/FileUpload";
import { GetPreview, SavePreview, LoadPreview } from "~/functions/uploads/LinkPreview";
import { Entity, checklist } from "~/types_const/planner";
import { Item } from "~/types_const/planner";

export const TaskItem = (props: {item: Item, entities: Record<Id, Entity>, setEntities: any, progressChoice: {name:string, colour:string}[], priorityChoice: {name:string, colour:string}[], type:string}) => {
    const sortable = createSortable(props.item.id, {
      type: "item",
      group: props.item.group,
    });
    const [itemstore, setItemStore] = createStore(props.item);
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
          props.setEntities(itemstore.id, itemstore);
          setItems(createIdsArray(itemstore.checklist));
          saveEntities(props.entities);
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
            <button onclick={() => {setItemStore("checklist", props.item, {checked: !itemstore.checklist[props.item].checked, content: itemstore.checklist[props.item].content}); setItemStore("lastupdate", new Date()); props.setEntities(itemstore.id, itemstore); saveEntities(props.entities)}}>
              <svg fill="#000000" version="1.1" class="m-auto w-5" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <polygon points="452.253,28.326 197.831,394.674 29.044,256.875 0,292.469 207.253,461.674 490,54.528 "></polygon> </g></svg>
            </button>
            :
            <button onclick={() => {setItemStore("checklist", props.item, {checked: !itemstore.checklist[props.item].checked, content: itemstore.checklist[props.item].content}); setItemStore("lastupdate", new Date()); props.setEntities(itemstore.id, itemstore); saveEntities(props.entities)}}>
              <svg fill="#000000" class="m-auto w-5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M0 14.545L1.455 16 8 9.455 14.545 16 16 14.545 9.455 8 16 1.455 14.545 0 8 6.545 1.455 0 0 1.455 6.545 8z" fill-rule="evenodd"></path> </g></svg>
            </button>
          }
        </div>
        <input
          class="input my-1 w-full text-sm col-span-10 m-auto"
          value={itemstore.checklist[props.item].content}
          onchange={(e)=> {setItemStore("checklist", props.item, {checked: itemstore.checklist[props.item].checked, content: e.target.value}); setItemStore("lastupdate", new Date()); props.setEntities(itemstore.id, itemstore); saveEntities(props.entities) }}
        />
        <div class="col-span-1 m-auto rounded-lg">
            <button onclick={() => {
              let removedarr = [];
              for (var x in itemstore.checklist) {
                if ((itemstore.checklist[x].content != itemstore.checklist[props.item].content) || (itemstore.checklist[x].checked != itemstore.checklist[props.item].checked)) {
                  removedarr.push(itemstore.checklist[x]);
                }
              }
              setItems(createIdsArray(removedarr)); setItemStore("checklist", removedarr); setItemStore("lastupdate", new Date()); props.setEntities(itemstore.id, itemstore); saveEntities(props.entities);}}>
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
        <label for={itemstore.id.toString()} class="modal cursor-pointer z-50">
          <label class="modal-box relative rounded-lg w-full h-full" for="">
            <input class="py-1 w-full text-lg font-bold" value={itemstore.name} onChange={(e) => {setItemStore("name", e.target.value); setItemStore("lastupdate", new Date()); props.setEntities(itemstore.id, itemstore); saveEntities(props.entities)}}/>
            <p class="py-1 text-left italic font-light">Last updated: {moment(itemstore.lastupdate).format("HH:mm DD-MM-YYYY")}</p>
            <div class="grid grid-cols-2">
              <div class="form-control w-full my-1 m-auto">
                <label class="label">
                  <span class="label-text">Startdate:</span>
                </label>
                <input type="date" class="input" value={itemstore.startdate} onChange={(e) => {setItemStore("startdate", e.target.value); setItemStore("lastupdate", new Date()); props.setEntities(itemstore.id, itemstore); saveEntities(props.entities)}} />
              </div>
              <div class="form-control w-full my-1 m-auto">
                <label class="label">
                  <span class="label-text">Duedate:</span>
                </label>
                <input type="date" class="input" value={itemstore.duedate} onChange={(e) => {setItemStore("duedate", e.target.value); setItemStore("lastupdate", new Date()); props.setEntities(itemstore.id, itemstore); saveEntities(props.entities)}} />
              </div>
              <div class="form-control w-full my-1 m-auto">
                <label class="label">
                  <span class="label-text">Progress:</span>
                </label>
                <select class="select" value={itemstore.progress} onChange={(e) => {setItemStore("progress", e.target.value); setItemStore("lastupdate", new Date()); props.setEntities(itemstore.id, itemstore); saveEntities(props.entities)}}>
                  <option>{itemstore.progress}</option>
                  <For each={props.progressChoice}>
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
                <select class="select" value={itemstore.priority} onChange={(e) => {setItemStore("priority", e.target.value); props.setEntities(itemstore.id, itemstore); saveEntities(props.entities)}}>
                  <option>{itemstore.priority}</option>
                  <For each={props.priorityChoice}>
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
              <textarea class="textarea textarea-bordered h-full rounded-lg" value={itemstore.description} onChange={(e) => {setItemStore("description", e.target.value); setItemStore("lastupdate", new Date()); props.setEntities(itemstore.id, itemstore); saveEntities(props.entities)}}></textarea>
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
                <button onClick={() => {try {setItemStore("checklist", (l: any) => [...l, {checked: false, content: "new checklist"}])}catch{setItemStore("checklist", [{checked: false, content: "new checklist"}])}; setItems(createIdsArray(itemstore.checklist)); setItems(createIdsArray(itemstore.checklist)); setItemStore("lastupdate", new Date()); props.setEntities(itemstore.id, itemstore); saveEntities(props.entities)}} 
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
            
            <button onclick={() => deletetask(itemstore.id, props.entities, props.type)} class="py-1 my-2 w-full bg-red-500 text-white rounded-lg hover:bg-red-700">DELETE TASK</button>
          </label>
        </label>
      </>
    );
  };

export const deletetask = async (itemid: number, entities: any, type: string) => {
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
    location.href = "/planner?" + type + "=true"; 
}