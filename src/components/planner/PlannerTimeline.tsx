import moment from "moment";
import { For, batch, createEffect, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { DragDropProvider, DragDropSensors, DragOverlay, Id, SortableProvider, closestCenter, createSortable, useDragDropContext } from "@thisbeyond/solid-dnd";
import { Entity, Item } from "~/types_const/planner";
import { getEntities } from "~/functions/planner/getEntities";
import { TaskItem } from "./ItemModal";
import { getPriorityChoice } from "~/functions/planner/priorityChoice";
import { getProgressChoice } from "~/functions/planner/progressChoice";
import { addItem } from "~/functions/planner/addItemGroup";
import { saveEntities } from "~/functions/planner/saveEntities";

const Sortable = (props: {allgroup: any[], type: string, colourscheme: number, entities: Record<Id, Entity>, setEntities: any, progressChoice: {name:string, colour:string}[], priorityChoice: {name:string, colour:string}[], item: Item}) => {
  const sortable = createSortable(props.item.id);
  const [state] = useDragDropContext();

  const hasPriorityorProgress = () => {
    try {
      if (props.colourscheme == 0 && props.priorityChoice.some(item => item.name == props.item.priority)) {
        return true
      }
      else if (props.colourscheme == 1 && props.progressChoice.some(item => item.name == props.item.progress)) {
        return true
      } else {
        return false
      }
    } catch {
      return false;
    }
  };
  
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
              {props.colourscheme == 0 ? 
                <>
                  <For each={props.priorityChoice}>
                      {(priority) => (
                          <>
                          {priority.name == props.item.priority &&
                              <div class="flex items-center flex-shrink-0 h-5 px-0.5 my-1 text-xs hover:bg-gray-200 w-full rounded-sm" style={{background: priority.colour}}>
                                <span class="ml-2 font-medium leading-none truncate">{props.item.name}</span>
                                <For each={props.allgroup}>
                                    {(group) => (
                                        <>
                                          {group.id == props.item.group &&
                                              <>
                                                <span class="ml-2 font-light leading-none">{group.name}</span>
                                              </>
                                          }
                                        </>
                                    )}
                                </For>
                              </div>
                          }
                          </>
                      )}
                  </For>
                </>
                :
                <>
                  <For each={props.progressChoice}>
                      {(progress) => (
                          <>
                          {progress.name == props.item.progress &&
                              <div class="flex items-center flex-shrink-0 h-5 px-0.5 my-1 text-xs hover:bg-gray-200 w-full rounded-sm" style={{background: progress.colour}}>
                                <span class="ml-2 font-medium leading-none truncate">{props.item.name}</span>
                                <For each={props.allgroup}>
                                    {(group) => (
                                        <>
                                        {group.id == props.item.group &&
                                            <>
                                              <span class="ml-2 font-light leading-none">{group.name}</span>
                                            </>
                                        }
                                        </>
                                    )}
                                </For>
                              </div>
                          }
                          </>
                      )}
                  </For>
                </>  
              }
              {!hasPriorityorProgress() &&
                <>
                  <div class="flex items-center flex-shrink-0 h-5 px-0.5 my-1 text-xs hover:bg-gray-200 w-full bg-red-400 rounded-sm">
                    <span class="ml-2 font-medium leading-none truncate">{props.item.name}</span>
                    <For each={props.allgroup}>
                        {(group) => (
                            <>
                            {group.id == props.item.group &&
                                <>
                                  <span class="ml-2 font-light leading-none">{group.name}</span>
                                </>
                            }
                            </>
                        )}
                    </For>
                  </div>
                </>
              }
          </div>
      </label>
  );
};

export const PlannerTimeline = (props: {id: number}) => {
    let nextOrder = 1;
    let nextID = 1;

    const [entities, setEntities] = createStore<Record<Id, Entity>>({});
    const [progressChoice, setProgressChoice] = createSignal(0);
    const [priorityChoice, setPriorityChoice] = createSignal(0);

    const setup = () => {
      batch(async () => {
        let ent = await getEntities(nextID, nextOrder, entities, setEntities, props.id); nextID = ent.nextID; nextOrder = ent.nextOrder;
        let progressChoice: string[] = await getProgressChoice(props.id);
        // @ts-ignore
        setProgressChoice(progressChoice);
        let priorityChoice: string[] = await getPriorityChoice(props.id);
        // @ts-ignore
        setPriorityChoice(priorityChoice);
      });
    };
    onMount(setup);

    function getAllDaysInMonth(year: number, month: number): moment.Moment[] {
      const startDate = moment({ year, month: month - 1, day: 1 });
      const endDate = moment(startDate).endOf('month');
      const days: moment.Moment[] = [];
      let currentDate = startDate;
      while (currentDate.isSameOrBefore(endDate, 'day')) {
        days.push(currentDate);
        currentDate = currentDate.clone().add(1, 'day');
      }
      return days;
    }

    const [targetmonth, setTargetMonth] = createSignal(0);

    const currentyear = moment().subtract(targetmonth(), 'month').year();
    const currentmonth = moment().subtract(targetmonth(), 'month').month()+1;
    const [startday, setStartDay] = createSignal(moment(moment().subtract(targetmonth(), 'month').startOf('month')).isoWeekday());
    
    const [daysInMonth, setDaysInMonth] = createSignal<readonly moment.Moment[]>(
      getAllDaysInMonth(currentyear, currentmonth)
    );

    createEffect(() => {
      const currentyear = moment().subtract(targetmonth(), 'month').year();
      const currentmonth = moment().subtract(targetmonth(), 'month').month() + 1;
      setDaysInMonth(getAllDaysInMonth(currentyear, currentmonth));
      setStartDay(moment(moment().subtract(targetmonth(), 'month').startOf('month')).isoWeekday());
    }, [targetmonth]);
    
    const [AllTasks, setAllTasks] = createSignal(new Array());
    const [allGroup, setAllGroup] = createSignal(new Array());
    createEffect(()=>{
      let allgroups = []; let alltasks = [];
      for (var x in entities) { if (entities[x].type == "group") {allgroups.push(entities[x])} else {alltasks.push(entities[x])} nextID+=1; nextOrder+=1;};
      allgroups.sort((a, b) => parseFloat(a.order) - parseFloat(b.order));
      alltasks.sort((a, b) => parseFloat(a.order) - parseFloat(b.order));
      setAllTasks(alltasks); setAllGroup(allgroups);
    }, [entities])

    const [colourscheme, setColourScheme] = createSignal(0);

    return (
        <>
              <div class="text-gray-700">
                <div class="flex flex-grow w-[95%] overflow-auto border-gray-200 border"> 
                    <div class="flex flex-col flex-grow">
                      <div class="flex items-center justify-between mt-4 px-4">
                        <div class="flex items-center">
                          <button onclick={() => setTargetMonth((prev) => prev + 1)}>
                            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button onclick={() => setTargetMonth((prev) => prev - 1)}>
                            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          <h2 class="ml-2 text-xl font-bold leading-none">{moment().subtract(targetmonth(), 'month').format('MMMM')}, {moment().subtract(targetmonth(), 'month').year()}</h2>
                          <button class="ml-2 text-lg font-medium leading-none bg-gray-200 hover:bg-gray-300 border-gray-300 shadow-sm p-2 rounded-lg" onclick={() => setTargetMonth(0)}>Now</button>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer ml-2">
                          <input type="checkbox" value={colourscheme()} class="sr-only peer" onchange={()=> {if(colourscheme()==0){setColourScheme(1)}else{setColourScheme(0)}}} />
                          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            {colourscheme() == 0 ?
                              <span class="ml-3 text-md font-medium text-gray-900 dark:text-gray-300">Priority colour scheme</span>
                            :
                              <span class="ml-3 text-md font-medium text-gray-900 dark:text-gray-300">Progress colour scheme</span>
                            }
                        </label>
                      </div>
                        <div class="grid grid-cols-7 mt-4">
                            <div class="pl-1 text-sm">Mon</div>
                            <div class="pl-1 text-sm">Tue</div>
                            <div class="pl-1 text-sm">Wed</div>
                            <div class="pl-1 text-sm">Thu</div>
                            <div class="pl-1 text-sm">Fri</div>
                            <div class="pl-1 text-sm">Sat</div>
                            <div class="pl-1 text-sm">Sun</div>
                        </div>
                        <div class="grid flex-grow w-full grid-cols-7 grid-rows-5 gap-px pt-px mt-1 bg-gray-200">
                            {Array.from({ length: startday()-1 }, () => (
                              <>
                                <div></div>
                              </>
                            ))}
                            <For each={daysInMonth()}>
                              {(day) => 
                                <div class="relative flex flex-col bg-white group">
                                  <span class="mx-2 my-1 text-xs font-bold">{day.date()}</span>
                                  <div class="flex flex-col px-1 py-1 overflow-auto">
                                      <For each={AllTasks()}>
                                        {(task: Item) => 
                                          <>
                                            {day.isBetween(task.startdate, task.duedate, null, '[]') == true &&

                                              <DragDropProvider
                                              collisionDetector={closestCenter}
                                              >
                                              <DragDropSensors />
                                              <div class="">
                                                  <SortableProvider ids={[]}>
                                                    <Sortable allgroup={allGroup()} item={task} colourscheme={colourscheme()} entities={entities} setEntities={setEntities} progressChoice={progressChoice()} priorityChoice={priorityChoice()} type={props.type} />
                                                    </SortableProvider>
                                              </div>
                                              <DragOverlay>
                                                  <div class="sortable"></div>
                                              </DragOverlay>
                                              </DragDropProvider>
                                            }
                                          </>
                                        }
                                      </For>
                                  </div>
                                  <button 
                                    class="absolute bottom-0 right-0 hover:flex items-center justify-center hidden w-6 h-6 mb-2 mr-2 text-white bg-gray-400 rounded group-hover:flex hover:bg-gray-500" 
                                    onclick={()=> {addItem({name: "new task", duedate: day.format("YYYY-MM-DD"), startdate: day.format("YYYY-MM-DD"), type: "item",group: 1, plannerid: props.id, progress: "",description: "",checklist: [],priority: "", lastupdate: new Date(),id: nextID += 1,order: (nextOrder += 1).toString(),externalfiles: [],externallinks: []}, setEntities); saveEntities(entities, props.id)}}>
                                      <svg viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 plus"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                                  </button>
                              </div>
                              }
                            </For>
                        </div>
                    </div>
                </div>

          </div>
        </>
    );
};