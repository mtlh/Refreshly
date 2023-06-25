import { For, batch, createEffect, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Id } from "@thisbeyond/solid-dnd";
import { Entity, Item } from "~/types_const/planner";
import { getEntities } from "~/functions/planner/getEntities";
import { getProgressChoice } from "~/functions/planner/progressChoice";
import { getPriorityChoice } from "~/functions/planner/priorityChoice";
import moment from "moment";
import { SortableVerticalListExample } from "../verticallist";

export const PlannerGrid = (props: {type: string}) => {
    let nextOrder = 1;
    let nextID = 1;

    const [entities, setEntities] = createStore<Record<Id, Entity>>({});
    const [progressChoice, setProgressChoice] = createSignal(new Array());
    const [priorityChoice, setPriorityChoice] = createSignal(new Array());

    const [allTask, setAllTask] = createSignal(new Array());
    const [allGroup, setAllGroup] = createSignal(new Array());

    const setup = () => {
    batch(async () => {
        let ent = await getEntities(nextID, nextOrder, entities, setEntities); nextID = ent.nextID; nextOrder = ent.nextOrder;
        // SetBoardCol(await getBoardCol());
        let progressChoice: string[] = await getProgressChoice();
        setProgressChoice(progressChoice);
        let priorityChoice: string[] = await getPriorityChoice();
        setPriorityChoice(priorityChoice);
    });
    };
    onMount(setup);
    
    createEffect(() => {
        let allgroups = []; let alltasks = [];
        for (var x in entities) { if (entities[x].type == "group") {allgroups.push(entities[x])} else {alltasks.push(entities[x])} nextID+=1; nextOrder+=1;};
        setAllTask(alltasks); setAllGroup(allgroups);
    }, [entities])

    return (
        <>
          <SortableVerticalListExample />
            <div class="relative overflow-x-auto m-2">
                <table class="w-full text-sm text-left text-gray-500">
                    <thead class="text-sm text-gray-700 uppercase bg-gray-200">
                        <tr>
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
                            <th scope="col" class="px-4 py-2">
                                Description
                            </th>
                            <th scope="col" class="px-4 py-2">
                                Checklist
                            </th>
                            <th scope="col" class="px-4 py-2">
                                Last Updated
                            </th>
                            <th scope="col" class="px-4 py-2">
                                Files
                            </th>
                            <th scope="col" class="px-4 py-2">
                                Links
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <For each={allTask()}>{ (task: Item) => 
                            <>
                            {/* <input type="checkbox" id={task.id.toString()} class="modal-toggle" />
                            <TaskItem item={task} entities={entities} setEntities={setEntities} progressChoice={progressChoice()} priorityChoice={priorityChoice()} type={props.type} /> */}
                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {task.name}
                                </th>
                                <td class="px-4 py-2">
                                    {task.group}
                                </td>
                                <td class="px-4 py-2">
                                    {task.priority}
                                </td>
                                <td class="px-4 py-2">
                                    {task.progress}
                                </td>
                                <td class="px-4 py-2">
                                    {moment(task.startdate).format("DD/MM/YYYY")}
                                </td>
                                <td class="px-4 py-2">
                                    {moment(task.duedate).format("DD/MM/YYYY")}
                                </td>
                                <td class="px-4 py-2">
                                    {task.description}
                                </td>
                                <td class="px-4 py-2">
                                    {/* {task.checklist.toString()} */}
                                    Checklist
                                </td>
                                <td class="px-4 py-2">
                                    {moment(task.lastupdate).format("hh:mm:ss DD/MM/YYYY")}
                                </td>
                                <td class="px-4 py-2">
                                    {/* {task.externalfiles} */}
                                    externalfiles
                                </td>
                                <td class="px-4 py-2">
                                    {/* {task.externallinks.toString()} */}
                                    externallinks
                                </td>
                            </tr>
                            </>
                        }</For>
                    </tbody>
                </table>
            </div>

        </>
    );
};