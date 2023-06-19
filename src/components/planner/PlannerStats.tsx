import { batch, createEffect, createSignal, onMount } from 'solid-js'
import { Chart, Title, Tooltip, Legend, Colors, ArcElement } from 'chart.js'
import { Pie, Radar, Scatter } from 'solid-chartjs'
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
    
    const [chartData, setChartData] = createSignal({
        labels: [],
        datasets: [{}],
    });

    const [chartOptions] = createSignal({
        responsive: true,
        maintainAspectRatio: false
    });

    onMount(() => {
        Chart.register(Title, Tooltip, Legend, Colors, ArcElement)
        batch(async () => {
            let ent = await getEntities(nextID, nextOrder, entities, setEntities); nextID = ent.nextID; nextOrder = ent.nextOrder;
            let tempnames: string[] = [];
            let tempgroupid = [];
            for (let task in entities) {
                if (entities[task].type == "group") {
                    tempnames.push(entities[task].name)
                    tempgroupid.push(entities[task].id)
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
            setNames(tempnames); setPieData(itemarr);
        });
    })

    createEffect(() => {
        setChartData({
            labels: names(),
            datasets: [
                {
                    data: piedata(),
                },
            ],
        });
    }, [piedata])

    const data = {
        labels: ['Thing 1', 'Thing 2', 'Thing 3', 'Thing 4', 'Thing 5', 'Thing 6'],
        datasets: [
          {
            label: '# of Votes',
            data: [2, 9, 3, 5, 2, 3],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
    };

    return (
        <>
         {chartData().labels.toString() != "" ?
            <>
                <div class='grid grid-cols-2 h-20 gap-2'>
                    <div class='p-2 bg-gray-200 shadow-lg border-gray-400 rounded-md'>
                        <Pie data={chartData()} options={chartOptions()} width={"100%"} height={"100%"} />
                    </div>
                    <div class='p-2 bg-gray-200 shadow-lg border-gray-400 rounded-md'>
                        <Radar data={data} width={"100%"} height={"100%"} />
                    </div>
                </div>
            </> 
         :
         <div></div>
         }
        </>
    )
}