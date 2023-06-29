import { For, JSX, batch, createEffect, createSignal, onMount } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { Id } from "@thisbeyond/solid-dnd";
import { Entity, Item } from "~/types_const/planner";
import { getEntities } from "~/functions/planner/getEntities";
import { getProgressChoice } from "~/functions/planner/progressChoice";
import { getPriorityChoice } from "~/functions/planner/priorityChoice";
import moment from "moment";
import { useDragDropContext } from "@thisbeyond/solid-dnd";
import {
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
  SortableProvider,
  createSortable,
  closestCenter,
} from "@thisbeyond/solid-dnd";
import { TaskItem } from "./ItemModal";
import { gridOrderUpdate } from "~/functions/planner/gridOrderUpdate";
import Cookies from "js-cookie";
import { saveEntities } from "~/functions/planner/saveEntities";
import { addItem } from "~/functions/planner/addItemGroup";
import { UpdateGroupShowFilter, getGroupShowFilter } from "~/functions/planner/filterGroupShow";

const Sortable = (props: {allgroup: any[], type: string, entities: Record<Id, Entity>, setEntities: any, progressChoice: {name:string, colour:string}[], priorityChoice: {name:string, colour:string}[], item: Item}) => {
    const sortable = createSortable(props.item.id);
    const [state] = useDragDropContext();
    return (
        <label
            for={props.item.id.toString()}
        >
            <div
                use:sortable
                class="sortable"
                classList={{
                "opacity-25": sortable.isActiveDraggable,
                "transition-transform": !!state.active.draggable,
                }}
            >
                <input type="checkbox" id={props.item.id.toString()} class="modal-toggle" />
                <TaskItem item={props.item} entities={props.entities} setEntities={props.setEntities} progressChoice={props.progressChoice} priorityChoice={props.priorityChoice} type={props.type} />
                <table class="w-full text-md text-left text-gray-500 overflow-x-auto">
                    <tbody>
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 grid grid-cols-4 md:grid-cols-6 gap-6">
                            <th scope="row" class="px-4 py-2 font-medium text-gray-900 dark:text-white">
                                {props.item.name}
                            </th>
                            <td class="px-4 py-2">
                                <For each={props.allgroup}>
                                    {(group) => (
                                        <>
                                        {group.id == props.item.group &&
                                            <p class={`text-gray-900`}>{group.name}</p>
                                        }
                                        </>
                                    )}
                                </For>
                            </td>
                            <td class="px-4 py-2">
                                <For each={props.priorityChoice}>
                                    {(priority) => (
                                        <>
                                        {priority.name == props.item.priority &&
                                            <p class={`text-white text-sm font-medium inline-flex items-center px-2.5 py-0.5 rounded-md`} style={{background: priority.colour}}>{priority.name}</p>
                                        }
                                        </>
                                    )}
                                </For>
                            </td>
                            <td class="px-4 py-2">
                                <For each={props.progressChoice}>
                                    {(progress) => (
                                        <>
                                        {progress.name == props.item.progress &&
                                            <p class={`text-white text-sm font-medium inline-flex items-center px-2.5 py-0.5 rounded-md`} style={{background: progress.colour}}>{progress.name}</p>
                                        }
                                        </>
                                    )}
                                </For>
                            </td>
                            <td class="px-4 py-2 hidden md:flex">
                                {props.item.startdate ?
                                    moment(props.item.startdate).format("DD/MM/YYYY")
                                    :
                                    "-"
                                }
                            </td>
                            <td class="px-4 py-2 hidden md:flex">
                                {props.item.duedate ?
                                    moment(props.item.duedate).format("DD/MM/YYYY")
                                    :
                                    "-"
                                }
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </label>
    );
  };

export const PlannerGrid = (props: {type: string}) => {
    let nextOrder = 1;
    let nextID = 1;

    const [entities, setEntities] = createStore<Record<Id, Entity>>({});
    const [progressChoice, setProgressChoice] = createSignal(0);
    const [priorityChoice, setPriorityChoice] = createSignal(0);

    const [AllTasks, setAllTasks] = createSignal(new Array());
    const [allGroup, setAllGroup] = createSignal(new Array());

    const [completed_count, setCompletedCount] = createSignal(0);

    const [groupfilter, SetGroupFilter] = createSignal(Array.from({length: allGroup().length}, () => true));
    function updateGroupFilterAtIndex(index: number, newValue: boolean) {
        SetGroupFilter(produce((draft: boolean[]) => {
          draft[index] = newValue;
        }));
    }

    const setup = () => {
    batch(async () => {
        let ent = await getEntities(nextID, nextOrder, entities, setEntities); nextID = ent.nextID; nextOrder = ent.nextOrder;
        let progressChoice: string[] = await getProgressChoice();
        // @ts-ignore
        setProgressChoice(progressChoice);
        let priorityChoice: string[] = await getPriorityChoice();
        // @ts-ignore
        setPriorityChoice(priorityChoice);

        SetGroupFilter(await getGroupShowFilter());

        setCompletedCount(AllTasks().filter(item => item.progress === 'Completed').length);
    });
    };
    onMount(setup);
    
    createEffect(()=>{
        let allgroups = []; let alltasks = [];
        for (var x in entities) { if (entities[x].type == "group") {allgroups.push(entities[x])} else {alltasks.push(entities[x])} nextID+=1; nextOrder+=1;};
        allgroups.sort((a, b) => parseFloat(a.order) - parseFloat(b.order));
        alltasks.sort((a, b) => parseFloat(a.order) - parseFloat(b.order));
        setAllTasks(alltasks); setAllGroup(allgroups);
    }, [entities])

    const [isOpen, setIsOpen] = createSignal(false);
    const toggleDropdown = () => {
        setIsOpen(!isOpen());
      };

    const IDS = () => AllTasks().map((task) => task.id);

    const onDragEnd = async ({ draggable, droppable }) => {
        if (draggable && droppable) {
            const currentTasks = AllTasks();
            const fromIndex = currentTasks.findIndex((task) => task.id === draggable.id);
            const toIndex = currentTasks.findIndex((task) => task.id === droppable.id);
            if (fromIndex !== toIndex) {
                const updatedTasks = currentTasks.slice();
                updatedTasks.splice(toIndex, 0, ...updatedTasks.splice(fromIndex, 1));
                setAllTasks(updatedTasks);
                await gridOrderUpdate(Cookies.get("auth"), draggable.id, droppable.id, AllTasks())
            }
        }
    };

    return (
        <>
            {priorityChoice() != 0 && progressChoice() != 0 && JSON.stringify(groupfilter()[0]) != "" &&
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
                            <For each={allGroup()}>
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
                <div class="relative">
                    <table class="w-full text-sm mt-6 text-left text-gray-500">
                        <thead class="text-sm text-gray-700 uppercase bg-gray-200">
                            <tr class="grid grid-cols-4 md:grid-cols-6 gap-6">
                                <th scope="col" class="px-4 py-2">
                                    Task Name
                                </th>
                                <th scope="col" class="px-4 py-2">
                                    Group
                                </th>
                                <th scope="col" class="px-4 py-2">
                                    Priority
                                </th>
                                <th scope="col" class="px-4 py-2">
                                    Progress
                                </th>
                                <th scope="col" class="px-4 py-2 hidden md:flex">
                                    Startdate
                                </th>
                                <th scope="col" class="px-4 py-2 hidden md:flex">
                                    Duedate
                                </th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <DragDropProvider
                onDragEnd={onDragEnd}
                collisionDetector={closestCenter}
                >
                <DragDropSensors />
                <div class="column self-stretch">
                    <SortableProvider ids={IDS()}>
                        <For each={AllTasks()}>
                            {(task: Item) => 
                                <>
                                    {groupfilter()[task.group-1] == true && task.progress != "Completed" && 
                                        <Sortable allgroup={allGroup()} item={task} entities={entities} setEntities={setEntities} progressChoice={progressChoice()} priorityChoice={priorityChoice()} type={props.type} />
                                    }
                                </>
                            }
                        </For>
                    </SortableProvider>
                </div>
                <DragOverlay>
                    <div class="sortable"></div>
                </DragOverlay>
                </DragDropProvider>
                <button onClick={()=> {addItem({
                    name: "new task",
                    type: "item",
                    group: 1,
                    progress: "",
                    description: "",
                    checklist: [],
                    priority: "",
                    lastupdate: new Date(),
                    id: nextID += 1,
                    order: (nextOrder += 1).toString(),
                    externalfiles: [],
                    externallinks: []
                }, setEntities); saveEntities(entities)}} class="bg-grey-100 text-2xl rounded-sm w-full text-black p-1 hover:ring-2 m-auto">
                    +
                </button>
                <button
                    class="flex items-center font-bold justify-between px-4 py-2 text-sm text-gray-700 bg-gray-200 uppercase rounded-sm focus:outline-none focus:bg-gray-300 m-auto w-full"
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
                    <div class="w-full">
                        <DragDropProvider
                        onDragEnd={onDragEnd}
                        collisionDetector={closestCenter}
                        >
                            <DragDropSensors />
                            <div class="column self-stretch">
                                <SortableProvider ids={IDS()}>
                                    <For each={AllTasks()}>
                                        {(task) => (
                                            <>
                                                {groupfilter()[task.group-1] == true && task.progress == "Completed" && 
                                                    <Sortable allgroup={allGroup()} item={task} entities={entities} setEntities={setEntities} progressChoice={progressChoice()} priorityChoice={priorityChoice()} type={props.type} />
                                                }
                                            </>
                                        )}
                                    </For>
                                </SortableProvider>
                            </div>
                            <DragOverlay>
                                <div class="sortable"></div>
                            </DragOverlay>
                        </DragDropProvider>
                    </div>
                )}
            </>
            }
        </>
    );
};