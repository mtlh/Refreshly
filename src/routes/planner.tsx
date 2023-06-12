import { createSignal } from "solid-js";
import { PlannerBoard } from "~/components/PlannerBoard";
import { PlannerList } from "~/components/PlannerList";
import { PlannerOptions } from "~/components/PlannerOptions";
import { PlannerStats } from "~/components/PlannerStats";

export default function Planner() {
  const [format, SetFormat] = createSignal("board");
  return (
    <main class="text-center mx-auto text-gray-700">
      <p class="m-2 p-2 text-4xl font-bold text-left w-full">Planner</p>
      <div class="flex flex-row text-left m-2 p-2 gap-10 underline underline-color text-xl font-normal">
        <button onclick={()=> SetFormat("board")}>Board</button>
        <button onclick={()=> SetFormat("list")}>List</button>
        <button onclick={()=> SetFormat("stats")}>Stats</button>
        <button onclick={()=> SetFormat("options")}>Options</button>
      </div>
      { format() == "board" &&
          <PlannerBoard />
      }
      { format() == "list" &&
          <PlannerList />
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
