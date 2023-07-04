import { For, createSignal } from "solid-js";
import "./Toggle.css"
import { useNavigate } from "solid-start";
import { createPlanner } from "~/functions/planner/createPlanner";
import Cookies from "js-cookie";
import { produce } from "solid-js/store";
 
export default function TogglePlanner(props: {path: string, plannerInfo: any[], setPlannerInfo: any}) {
  var basestate = "";
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('planner') == 'true') {
      basestate = "quick-example-active";
    }
  }
  const [toggleclass, setToggleClass] = createSignal(basestate);
  function invertToggleClass() {
    if (toggleclass() == ""){
      setToggleClass("quick-example-active");
      localStorage.setItem('planner', 'true');
    } else {
      setToggleClass("");
      localStorage.setItem('planner', 'false');
    }
  }
  
  return (
    <>
      <p onclick={invertToggleClass} class="flex items-center p-2 text-white rounded-lg dark:text-white dark:hover:bg-gray-700 transition ease-in-out duration-200 cursor-pointer">
          {toggleclass() == "quick-example-active" ?
              <svg class="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-gray-400" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              :
              <svg class="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-gray-400" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 15 12 9 18 15"></polyline>
              </svg>
          }
          <span class="flex-1 ml-3 whitespace-nowrap">Planner</span>
      </p>
      <ul id="dropdown-example" class={"quick-example bg-sky-800 rounded-xl  " + toggleclass()}>
        <div>
            <For each={props.plannerInfo}>{(info: any)=> 
                <>
                    {props.path == "/planner/"+ info.planner.url +"/" ?
                    <>
                        <li>
                            <a href={"/planner/"+ info.planner.url +"/"} class="flex bg-white text-black items-center p-2 rounded-lg dark:text-white dark:hover:bg-gray-700">
                                <svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-black transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                <span class="flex-1 ml-3 whitespace-nowrap">{info.planner.url}</span>
                            </a>
                        </li>
                    </>
                    :
                    <>
                        <li>
                            <a href={"/planner/"+ info.planner.url +"/"} class="flex items-center p-2 text-white rounded-lg dark:text-white dark:hover:bg-gray-700">
                            <svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                <span class="flex-1 ml-3 whitespace-nowrap">{info.planner.url}</span>
                            </a>
                        </li>
                    </>
                    }
                </>
            }</For>
            <li>
                <a onclick={async ()=> {const newplanner = await createPlanner(Cookies.get("auth")!); props.setPlannerInfo((newplanner));}} class="flex items-center p-2 text-white rounded-lg dark:text-white dark:hover:bg-gray-700">
                    <svg class="flex-shrink-0 w-6 h-5 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" viewBox="0 -0.5 9 9" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>plus_mini [#fffafa]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-345.000000, -206.000000)" fill="#ffffff"> <g id="icons" transform="translate(56.000000, 160.000000)"> <polygon id="plus_mini-[#fffafa]" points="298 49 298 51 294.625 51 294.625 54 292.375 54 292.375 51 289 51 289 49 292.375 49 292.375 46 294.625 46 294.625 49"> </polygon> </g> </g> </g> </g></svg>
                    <span class="flex-1 ml-3 whitespace-nowrap">New Planner</span>
                </a>
            </li>
        </div>
      </ul>
    </>
  );
}