import { useNavigate, useParams } from "@solidjs/router";
import Cookies from "js-cookie";
import { createEffect, createSignal } from "solid-js";
import { useSearchParams } from "solid-start";
import { PlannerBoard } from "~/components/planner/PlannerBoard";
import { PlannerGrid } from "~/components/planner/PlannerGrid";
import { PlannerOptions } from "~/components/planner/PlannerOptions";
import { PlannerStats } from "~/components/planner/PlannerStats";
import { PlannerTimeline } from "~/components/planner/PlannerTimeline";
import { PlannerAuth } from "~/functions/planner/plannerauth";
import NotFound from "../[...404]";

export default function Planner() {
  const nav = useNavigate();
  const params = useParams();
  console.log(params.url)

  const [canView, setCanView] = createSignal({view: false, id: 0});
  createEffect(async () => {
    const plannerid = await PlannerAuth(Cookies.get("auth")!, params.url);
    console.log(plannerid)
    if (plannerid != 0){
      setCanView({view: true, id: plannerid});
    }
    console.log(canView())
  }, [])

  const [format, SetFormat] = createSignal("board");
  const [searchParams] = useSearchParams();
  if (searchParams.options) {
    SetFormat("options")
  } 
  else if ( searchParams.grid) {
    SetFormat("grid")
  } 
  else if ( searchParams.board) {
    SetFormat("board")
  } 
  else if ( searchParams.schedule) {
    SetFormat("schedule")
  } 
  else if ( searchParams.stats) {
    SetFormat("stats")
  }
  return (
    <>
      {canView().view == true ?
        <main class="text-center mx-auto text-gray-700 p-4">
          <p class="m-2 p-2 text-4xl font-bold text-left w-full">Your Planner</p>
          <div class="flex flex-row text-left m-2 p-2 gap-4 md:gap-10 underline underline-color text-lg md:text-xl font-normal">
            <button onclick={()=> {SetFormat("board"); nav("/planner/"+ params.url + "?board=true")}}>Board</button>
            <button onclick={()=> {SetFormat("grid"); nav("/planner/"+ params.url + "?grid=true")}}>Grid</button>
            <button onclick={()=> {SetFormat("schedule"); nav("/planner/"+ params.url + "?schedule=true")}}>Schedule</button>
            <button onclick={()=> {SetFormat("stats"); nav("/planner/"+ params.url + "?stats=true")}}>Stats</button>
            <button onclick={()=> {SetFormat("options"); nav("/planner/"+ params.url + "?options=true")}}>Options</button>
          </div>
          {/* { format() == "board" &&
              <PlannerBoard type="board" id={canView().id} />
          }
          { format() == "grid" &&
              <PlannerGrid type="grid" id={canView().id} />
          }
          { format() == "schedule" &&
              <PlannerTimeline id={canView().id} />
          }
          { format() == "stats" &&
              <PlannerStats id={canView().id} />
          }
          { format() == "options" &&
              <PlannerOptions id={canView().id} />
          } */}
        </main>
      :
        <NotFound />
      }
    </>
  );
}
