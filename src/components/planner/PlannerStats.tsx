import { batch, createEffect, createSignal, onMount } from 'solid-js'
import { Chart, Title, Tooltip, Legend, Colors, ArcElement, LinearScale } from 'chart.js'
import { Bar, Pie } from 'solid-chartjs'
import { getEntities } from '~/functions/planner/getEntities'
import { createStore } from 'solid-js/store'
import { Entity } from '~/types_const/planner'
import { Id } from '@thisbeyond/solid-dnd'

export const PlannerStats = () => {

    let nextOrder = 1;
    let nextID = 1;
    const [entities, setEntities] = createStore<Record<Id, Entity>>({});
    const [names, setNames] = createSignal([])
    const [piedata, setPieData] = createSignal([])
    const [priorityNames, setPriorityNames] = createSignal([])
    const [priorityData, setPriorityData] = createSignal([])
    
    const [chartData, setChartData] = createSignal({labels: [],datasets: [{}]});
    const [barData, setBarData] = createSignal({labels: [], datasets: [{ label: "Count" }]});
    const [barOptions] = createSignal({responsive: true, maintainAspectRatio: false});
    const [pieOptions] = createSignal({responsive: true, maintainAspectRatio: false});

    onMount(() => {
        Chart.register(Title, Tooltip, Legend, Colors, ArcElement, LinearScale)
        batch(async () => {
            let ent = await getEntities(nextID, nextOrder, entities, setEntities); nextID = ent.nextID; nextOrder = ent.nextOrder;
            let tempnames: string[] = []; let tempgroupid = [];
            let taskprioritynames: string[] = []; let taskprioritynums = [];
            for (let task in entities) {
                if (entities[task].type == "group") {
                    tempnames.push(entities[task].name); tempgroupid.push(entities[task].id);
                } else {
                     // @ts-ignore
                    const index = taskprioritynames.indexOf(entities[task].progress); if (index === -1) { taskprioritynames.push(entities[task].progress); taskprioritynums.push(1); } else { taskprioritynums[index]++; }
                }
            }; 
            const itemarr: number[] = new Array(tempnames.length).fill(null).map(() => 0);
            for (let task in entities) {
                for (let id in tempgroupid) {
                    // @ts-ignore
                    if (entities[task].groupid == tempgroupid[id]) {
                        itemarr[id] += 1;
                    }
                }
            };
            // @ts-ignore
            setPriorityData(taskprioritynums); setPriorityNames(taskprioritynames); setNames(tempnames); setPieData(itemarr);
        });
    })

    createEffect(() => {
        setChartData({labels: names(), datasets: [{ data: piedata()}]});
        setBarData({labels: priorityNames(), datasets: [{ data: priorityData(), label: "Count"}]});
    }, [piedata])

    // Amount per group
    // Status (progress) pie chart
    // Priority bar chart
    // 

    return (
        <>
         {chartData().labels.toString() != "" ?
            <>
                <div class='grid grid-cols-2 h-20 gap-2'>
                    <div class='p-2 bg-gray-200 shadow-lg border-gray-400 rounded-md w-full h-60'>
                        <Pie data={chartData()} options={pieOptions()}/>
                    </div>
                    <div class='p-2 bg-gray-200 shadow-lg border-gray-400 rounded-md m-auto w-full h-60'>
                        <Bar data={barData()} options={barOptions()} />
                    </div>
                </div>
            </> 
         :
         <div></div>
         }
        </>
    )
}