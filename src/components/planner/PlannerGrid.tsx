import { For, JSX, batch, createEffect, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
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
                            <td class="px-4 py-2">
                                {props.item.startdate ?
                                    moment(props.item.startdate).format("DD/MM/YYYY")
                                    :
                                    "-"
                                }
                            </td>
                            <td class="px-4 py-2">
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

    const setup = () => {
    batch(async () => {
        let ent = await getEntities(nextID, nextOrder, entities, setEntities); nextID = ent.nextID; nextOrder = ent.nextOrder;
        let progressChoice: string[] = await getProgressChoice();
        // @ts-ignore
        setProgressChoice(progressChoice);
        let priorityChoice: string[] = await getPriorityChoice();
        // @ts-ignore
        setPriorityChoice(priorityChoice);

        let allgroups = []; let alltasks = [];
        for (var x in entities) { if (entities[x].type == "group") {allgroups.push(entities[x])} else {alltasks.push(entities[x])} nextID+=1; nextOrder+=1;};
        allgroups.sort((a, b) => parseFloat(a.order) - parseFloat(b.order));
        alltasks.sort((a, b) => parseFloat(a.order) - parseFloat(b.order));
        setAllTasks(alltasks); setAllGroup(allgroups);
    });
    };
    onMount(setup);

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
                await gridOrderUpdate(Cookies.get("auth"), draggable.id, droppable.id)
            }
        }
    };

    return (
        <>
            {priorityChoice() != 0 && progressChoice() != 0 &&
            <>
                <div class="relative">
                    <table class="w-full text-sm text-left text-gray-500">
                        <thead class="text-sm text-gray-700 uppercase bg-gray-200">
                            <tr class="grid grid-cols-6 gap-6">
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
                                <th scope="col" class="px-4 py-2">
                                    Startdate
                                </th>
                                <th scope="col" class="px-4 py-2">
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
                    <For each={AllTasks()}>{(task) => <Sortable allgroup={allGroup()} item={task} entities={entities} setEntities={setEntities} progressChoice={progressChoice()} priorityChoice={priorityChoice()} type={props.type} />}</For>
                    </SortableProvider>
                </div>
                <DragOverlay>
                    <div class="sortable"></div>
                </DragOverlay>
                </DragDropProvider>
            </>
            }
        </>
    );
};