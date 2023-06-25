import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { useSearchParams } from "solid-start";
import { PlannerBoard } from "~/components/planner/PlannerBoard";
import { PlannerOptions } from "~/components/planner/PlannerOptions";
import { PlannerStats } from "~/components/planner/PlannerStats";
import { PlannerTimeline } from "~/components/planner/PlannerTimeline";

export default function Planner() {
  const nav = useNavigate();
  const [format, SetFormat] = createSignal("board");
  const [searchParams] = useSearchParams();
  if (searchParams.options) {
    SetFormat("options")
  } 
  // else if ( searchParams.list) {
  //   SetFormat("list")
  // } 
  else if ( searchParams.board) {
    SetFormat("board")
  } 
  else if ( searchParams.timeline) {
    SetFormat("timeline")
  } 
  else if ( searchParams.stats) {
    SetFormat("stats")
  }
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <p class="m-2 p-2 text-4xl font-bold text-left w-full">Your Planner</p>
      <div class="flex flex-row text-left m-2 p-2 gap-4 md:gap-10 underline underline-color text-lg md:text-xl font-normal">
        <button onclick={()=> {SetFormat("board"); nav("/planner?board=true")}}>Board</button>
        {/* <button onclick={()=> {SetFormat("list"); nav("/planner?list=true")}}>List</button> */}
        <button onclick={()=> {SetFormat("timeline"); nav("/planner?timeline=true")}}>Timeline</button>
        <button onclick={()=> {SetFormat("stats"); nav("/planner?stats=true")}}>Stats</button>
        <button onclick={()=> {SetFormat("options"); nav("/planner?options=true")}}>Options</button>
      </div>
      { format() == "board" &&
          <PlannerBoard type="board" />
      }
      {/* { format() == "list" &&
          <PlannerBoard type="list" />
      } */}
      { format() == "timeline" &&
          <PlannerTimeline />
      }
      { format() == "stats" &&
          <PlannerStats />
      }
      { format() == "options" &&
          <PlannerOptions />
      }
    </main>
  );
}
