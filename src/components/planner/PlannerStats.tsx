import { batch, createEffect, createSignal, onMount } from 'solid-js'
import { Chart, Title, Tooltip, Legend, Colors, ArcElement, LinearScale, RadialLinearScale } from 'chart.js'
import { Bar, Pie, PolarArea } from 'solid-chartjs'
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
    const [progressNames, setProgressNames] = createSignal([])
    const [progressData, setProgressData] = createSignal([])
    
    const [chartData, setChartData] = createSignal({labels: [],datasets: [{}]});
    const [barData, setBarData] = createSignal({labels: [], datasets: [{ label: "Count" }]});
    const [polarData, setPolarData] = createSignal({labels: [], datasets: [{}]});

    const [barOptions] = createSignal({responsive: true, maintainAspectRatio: false});
    const [pieOptions] = createSignal({responsive: true, maintainAspectRatio: false});
    const [polarOptions] = createSignal({responsive: true, maintainAspectRatio: false});

    onMount(() => {
        Chart.register(Title, Tooltip, Legend, Colors, ArcElement, LinearScale, RadialLinearScale)
        batch(async () => {
            let ent = await getEntities(nextID, nextOrder, entities, setEntities); nextID = ent.nextID; nextOrder = ent.nextOrder;
            let tempnames: string[] = []; let tempgroupid = [];
            let taskprioritynames: string[] = []; let taskprioritynums = [];
            let taskprogressnames: string[] = []; let taskprogressnums = [];
            for (let task in entities) {
                if (entities[task].type == "group") {
                    tempnames.push(entities[task].name); tempgroupid.push(entities[task].id);
                } else {
                     // @ts-ignore
                    const index = taskprioritynames.indexOf(entities[task].priority); if (index === -1) { taskprioritynames.push(entities[task].priority); taskprioritynums.push(1); } else { taskprioritynums[index]++; }
                    // @ts-ignore
                    const index2 = taskprogressnames.indexOf(entities[task].progress); if (index2 === -1) { taskprogressnames.push(entities[task].progress); taskprogressnums.push(1); } else { taskprogressnums[index2]++; }
                }
            }; 
            const itemarr: number[] = new Array(tempnames.length).fill(null).map(() => 0);
            for (let task in entities) {
                for (let id in tempgroupid) {
                    // @ts-ignore
                    if (entities[task].group == tempgroupid[id]) {
                        itemarr[id] += 1;
                    }
                }
            };
            // @ts-ignore
            setProgressData(taskprogressnums); setProgressNames(taskprogressnames); setPriorityData(taskprioritynums); setPriorityNames(taskprioritynames); setNames(tempnames); setPieData(itemarr);
        });
    })

    createEffect(() => {
        setChartData({labels: names(), datasets: [{ data: piedata()}], });
        setBarData({labels: priorityNames(), datasets: [{ data: priorityData(), label: "Count"}]});
        setPolarData({labels: progressNames(), datasets: [{ data: progressData()}]});
    }, [piedata])

    // Amount per group
    // Status (progress) pie chart
    // Priority bar chart
    // 
    return (
        <>
         {chartData().labels.toString() != "" ?
            <>
                <div class='grid grid-cols-2 md:grid-cols-3 gap-6'>
                    <div class='p-2 bg-gray-100 shadow-lg border-gray-400 rounded-md w-full h-96 relative pt-12'>
                        <div class="absolute left-0 top-0 h-10 w-30 text-lg font-medium m-2">Groups</div>
                        {/* Amount of tasks per group */}
                        <Pie data={chartData()} options={pieOptions()} />
                    </div>
                    <div class='p-2 bg-gray-100 shadow-lg border-gray-400 rounded-md m-auto w-full h-96 relative pt-12'>
                        <div class="absolute left-0 top-0 h-10 w-30 text-lg font-medium m-2">Progress</div>
                        {/* Priority split across tasks */}
                        <PolarArea data={polarData()} options={polarOptions()} />
                    </div>
                    <div class='p-2 bg-gray-100 shadow-lg border-gray-400 rounded-md m-auto w-full h-96 relative pt-12'>
                        <div class="absolute left-0 top-0 h-10 w-30 text-lg font-medium m-2">Priority</div>
                        {/* Priority split across tasks */}
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