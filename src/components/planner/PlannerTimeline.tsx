import moment from "moment";
import { For, batch, createEffect, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Id } from "@thisbeyond/solid-dnd";
import { Entity, Item } from "~/types_const/planner";
import { getEntities } from "~/functions/planner/getEntities";

export const PlannerTimeline = () => {
    let nextOrder = 1;
    let nextID = 1;

    const [entities, setEntities] = createStore<Record<Id, Entity>>({});
    const setup = () => {
      batch(async () => {
        let ent = await getEntities(nextID, nextOrder, entities, setEntities); nextID = ent.nextID; nextOrder = ent.nextOrder;
      });
    };
    onMount(setup);

    //console.log(moment(new Date()).add(1, 'months').format("DD/MM/YYYY"))

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
    
    

    return (
        <>
              <div class="text-gray-700">
                <div class="flex flex-grow w-[95%] h-full overflow-auto border-gray-200 border"> 
                    <div class="flex flex-col flex-grow">
                        <div class="flex items-center mt-4">
                            <div class="flex ml-6">
                              <button onclick={() => setTargetMonth((prev) => prev - 1)}>
                                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                                <button onclick={()=> setTargetMonth((prev) => prev+1)}>
                                    <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                      </svg>
                                </button>
                            </div>
                            <h2 class="ml-2 text-xl font-bold leading-none">{moment().subtract(targetmonth(), 'month').format('MMMM')}, {moment().subtract(targetmonth(), 'month').year()}</h2>
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
                                      <button class="flex items-center flex-shrink-0 h-5 px-1 text-xs hover:bg-gray-200">
                                          <span class="flex-shrink-0 w-2 h-2 border border-gray-500 rounded-full"></span>
                                          <span class="ml-2 font-light leading-none">8:30am</span>
                                          <span class="ml-2 font-medium leading-none truncate">An unconfirmed event</span>
                                      </button>
                                      <button class="flex items-center flex-shrink-0 h-5 px-1 text-xs hover:bg-gray-200">
                                          <span class="flex-shrink-0 w-2 h-2 bg-gray-500 rounded-full"></span>
                                          <span class="ml-2 font-light leading-none">2:15pm</span>
                                          <span class="ml-2 font-medium leading-none truncate">A confirmed event</span>
                                      </button>
                                  </div>
                                  <button class="absolute bottom-0 right-0 flex items-center justify-center hidden w-6 h-6 mb-2 mr-2 text-white bg-gray-400 rounded group-hover:flex hover:bg-gray-500">
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