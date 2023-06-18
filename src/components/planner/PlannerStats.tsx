import { batch, createEffect, createSignal, onMount } from 'solid-js'
import { Chart, Title, Tooltip, Legend, Colors, ArcElement } from 'chart.js'
import { Pie } from 'solid-chartjs'
import { getEntities } from '~/functions/planner/getEntities'
import { createStore } from 'solid-js/store'
import { Entity } from '~/types_const/planner'
import { Id } from '@thisbeyond/solid-dnd'

export const PlannerStats = () => {

    let nextOrder = 1;
    let nextID = 1;
    const [entities, setEntities] = createStore<Record<Id, Entity>>({});
    const [names, setNames] = createSignal([])
    
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
            let tempnames = [];
            for (let task in entities) {
                tempnames.push(entities[task].name)
            }; 
            // @ts-ignore
            setNames(tempnames);
        });
    })

    createEffect(() => {
        setChartData({
            labels: names(),
            datasets: [
                {
                    label: 'Sales',
                    data: [50, 60, 70, 80, 90],
                },
            ],
        });
    }, [names])

    return (
        <>
         {chartData().labels.toString() != "" ?
            <>
                <div class='grid grid-cols-2 h-80'>
                    <div>
                        <Pie data={chartData()} options={chartOptions()} width={"100%"} height={"100%"} />
                    </div>
                    <div></div>
                </div>
            </> 
         :
         <div></div>
         }
        </>
    )
}