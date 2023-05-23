import Cookies from "js-cookie";
import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate } from "solid-start";
import NotLoggedIn from "~/components/NotLoggedIn";
import { getAuth } from "~/functions/getAuth";
import { createSignal } from 'solid-js';

export default function SettingsPage() {
  const [password, setPassword] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [username, setUsername] = createSignal('');

  const nav = useNavigate();
  const [auth, setAuth] = createStore({
    loggedin: false,
    user: {
      username: "",
      displayname: "",
      email: "",
      imgurl: "",
    }
  });
  //const [auth] = createResource(getAuth);
  createEffect(async () => {
    setAuth(await getAuth(Cookies.get("auth")));
    if (auth.loggedin == false) {nav("/login")};
  });

  const handleSubmitPassword = () => {
    // Handle password change logic here
    console.log('Password changed:', password());
  };

  const handleSubmitEmail = () => {
    // Handle email change logic here
    console.log('Email changed:', email());
  };

  const handleSubmitUsername = () => {
    // Handle username change logic here
    console.log('Username changed:', username());
  };

  return (
      <>
        {auth.loggedin == true &&
         <>
            <div class={`max-w-md mx-auto p-4`}>
              <div class={`flex flex-col items-center space-y-4`}>
                <img
                  src={auth.user.imgurl}// Replace with actual profile picture URL
                  alt="Profile Picture"
                  class={`w-32 h-32 rounded-full`}
                />
                <h2 class={`text-xl font-bold`}>{auth.user.displayname}</h2>
              </div>
              <div class={`mt-8 space-y-4`}>
                <div>
                  <label class={`block font-semibold`} for="password">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    class={`w-full p-2 border border-gray-300 rounded`}
                    value={password()}
                    onInput={(event) => setPassword(event.target.value)}
                  />
                  <button
                    class={`mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600`}
                    onClick={handleSubmitPassword}
                  >
                    Confirm Password
                  </button>
                </div>

                <div>
                  <label class={`block font-semibold`} for="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    class={`w-full p-2 border border-gray-300 rounded`}
                    value={email()}
                    onInput={(event) => setEmail(event.target.value)}
                  />
                  <button
                    class={`mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600`}
                    onClick={handleSubmitEmail}
                  >
                    Confirm Email
                  </button>
                </div>

                <div>
                  <label class={`block font-semibold`} for="username">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    class={`w-full p-2 border border-gray-300 rounded`}
                    value={username()}
                    onInput={(event) => setUsername(event.target.value)}
                  />
                  <button
                    class={`mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600`}
                    onClick={handleSubmitUsername}
                  >
                    Confirm Username
                  </button>
                </div>
              </div>
            </div>
         </>
       }
       {auth.user.username == 'none ' && auth.loggedin == false && 
        <>
          <NotLoggedIn />
        </>
       }
     </>
  );
}
