import moment from "moment";
import { For, batch, createEffect, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Id } from "@thisbeyond/solid-dnd";
import { Entity, Item } from "~/types_const/planner";
import { getEntities } from "~/functions/planner/getEntities";
import { UploadAvatar } from "~/functions/uploads/UploadAvatar";

export const PlannerTimeline = () => {
    let nextOrder = 1;
    let nextID = 1;

    const [entities, setEntities] = createStore<Record<Id, Entity>>({});
    const setup = () => {
    batch(async () => {
      let ent = await getEntities(nextID, nextOrder, entities, setEntities); nextID = ent.nextID; nextOrder = ent.nextOrder;

      console.log(await UploadAvatar(""))

    });
    };
    onMount(setup);
    
    const [taskCount, setTaskCount] = createSignal(new Array());
    createEffect(() => {
        let tempgroup = [];
        for (var x in entities) { if (entities[x].type == "item") {tempgroup.push(entities[x]);}};
        function compareDueDate(a: Item, b: Item) {
            if (a.duedate === null && b.duedate === null) {
              return 0;
            } else if (a.duedate === null) {
              return 1;
            } else if (b.duedate === null) {
              return -1;
            }
            const dateA = new Date(a.duedate!);
            const dateB = new Date(b.duedate!);
            if (dateA < dateB) {
              return -1;
            } else if (dateA > dateB) {
              return 1;
            } else {
              return 0;
            }
        }
        tempgroup.push({name: "Now", duedate: moment(new Date()).format("YYYY-MM-DD")})
        let itemarr = tempgroup as Item[]; 
        itemarr.sort(compareDueDate);
        setTaskCount(itemarr);

    }, [entities])

    

    return (
        <>
            <ol class="relative border-l border-sky-200 dark:border-sky-800 text-left mb-4 p-2">
                <For each={taskCount()}>{(task: Item) =>
                <>
                    <li class="mb-10 ml-4">
                        <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                        <time class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{moment(task.duedate).format("DD MMM YYYY")}</time>
                        { task.name == "Now" && moment(task.duedate).format("DD MM YYYY") == moment(new Date()).format("DD MM YYYY") ?
                            <h3 class="text-lg font-semibold text-red-600 dark:text-white">{task.name}</h3>
                            :
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{task.name}</h3>
                        }
                        <p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{task.description}</p>
                    </li>
                </>
                }</For>
            </ol>

        </>
    );
};