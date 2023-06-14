import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { useSearchParams } from "solid-start";
import { PlannerBoard } from "~/components/PlannerBoard";
import { PlannerOptions } from "~/components/PlannerOptions";
import { PlannerStats } from "~/components/PlannerStats";

export default function Planner() {
  const nav = useNavigate();
  const [format, SetFormat] = createSignal("board");
  const [searchParams] = useSearchParams();
  if (searchParams.options) {
    SetFormat("options")
  } else if ( searchParams.list) {
    SetFormat("list")
  } else if ( searchParams.board) {
    SetFormat("board")
  }
  return (
    <main class="text-center mx-auto text-gray-700">
      <p class="m-2 p-2 text-4xl font-bold text-left w-full">Planner</p>
      <div class="flex flex-row text-left m-2 p-2 gap-10 underline underline-color text-xl font-normal">
        <button onclick={()=> {SetFormat("board"); nav("/planner?board=true")}}>Board</button>
        <button onclick={()=> {SetFormat("list"); nav("/planner?list=true")}}>List</button>
        <button onclick={()=> {SetFormat("stats"); nav("/planner?stats=true")}}>Stats</button>
        <button onclick={()=> {SetFormat("options"); nav("/planner?options=true")}}>Options</button>
      </div>
      { format() == "board" &&
          <PlannerBoard type="board" />
      }
      { format() == "list" &&
          <PlannerBoard type="list" />
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
