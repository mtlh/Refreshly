import { createSignal } from "solid-js";
import "./Toggle.css"
 
function ToggleTeam() {
  var basestate = "";
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('team') == 'true') {
      basestate = "quick-example-active";
    }
  }
  const [toggleclass, setToggleClass] = createSignal(basestate);
  function invertToggleClass() {
    if (toggleclass() == ""){
      setToggleClass("quick-example-active");
      localStorage.setItem('team', 'true');
    } else {
      setToggleClass("");
      localStorage.setItem('team', 'false');
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
          <span class="flex-1 ml-3 whitespace-nowrap">Teams</span>
      </p>
      <ul id="dropdown-example" class={"quick-example bg-sky-800 rounded-xl  " + toggleclass()}>
        <div>
            <li>
              <a href="/user" class="flex items-center p-2 text-white rounded-lg dark:text-white dark:hover:bg-gray-700">
                <svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-white transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
                <span class="flex-1 ml-3 whitespace-nowrap">Team</span>
              </a>
            </li>
        </div>
      </ul>
    </>
  );
}

export default ToggleTeam;