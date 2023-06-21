import Cookies from "js-cookie";
import { For, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate } from "solid-start";
import NotLoggedIn from "~/components/NotLoggedIn";
import { getAuth } from "~/functions/getAuth";
import { createSignal } from 'solid-js';
import server$ from "solid-start/server";
import { db } from "~/functions/db_client";
import { eq } from "drizzle-orm";
import { auth, customise } from "~/db/schema";
import { encrypt, encryptCheck } from "~/functions/encrypt";
import { base_noauth, type baseauthtype } from "~/functions/db_config";

export default function SettingsPage() {
  const [isauth, setAuth] = createStore(base_noauth);

  const [Currentpassword, setCurrentPassword] = createSignal('');
  const [NewPassword, setNewPassword] = createSignal('');
  const [ConfirmPassword, setConfirmPassword] = createSignal('');
  const [PasswordError, setPasswordError] = createSignal('');
  const [PasswordSuccess, setPasswordSuccess] = createSignal('');

  const [NewUsername, setNewUsername] = createSignal('');
  const [isavailable, setAvailable] = createSignal("ring-2 ring-green-500");

  const [email, setEmail] = createSignal(isauth.user.email);
  const [username, setUsername] = createSignal(isauth.user.username);

  const nav = useNavigate();
  //const [auth] = createResource(getAuth);
  createEffect(async () => {
    setAuth(await getAuth(Cookies.get("auth")));
    if (isauth.loggedin == false) {nav("/login")};
  });

  const handleSubmitPassword = async () => {
    setPasswordError('');setPasswordSuccess('');
    const checkpassword = server$(async (oldpass: string, newpass: string, confpass: string, username: string, token) => {
      if (oldpass && newpass && confpass) {
        if (newpass == confpass) {
          const findusername = await db.select().from(auth).where(eq(auth.username, username));
          const authcheck = await getAuth(token);
          if (findusername.length == 1 && authcheck.loggedin == true) {
              const issame = await encryptCheck(oldpass, findusername[0].pass);
              if (issame == true) {
                const updatetoken = await db.update(auth).set({pass: await encrypt(newpass)}).where(eq(auth.username, username)); 
                return "Updated password.";
              } else {
                  return "Invalid password.";
              }
          } else {
              return "User is not authenticated.";
          }
        } else {
          return 'New and confirmation passwords do not match.';
        }
      } else {
        return 'Please complete all fields.'
      }
    })
    var error: string = await checkpassword(Currentpassword(), NewPassword(), ConfirmPassword(), username(), Cookies.get("auth"));
    if (error == 'Updated password.') { setPasswordSuccess(error); setPasswordError('') } else { setPasswordError(error); setPasswordSuccess('')}
  };

  const handleSubmitEmail = () => {
    // Handle email change logic here
    console.log('Email changed:', email());
  };

  const handleSubmitUsername = async () => {
    setPasswordError('');setPasswordSuccess('');
    const checkusername = server$(async (confpass: string, username: string, newusername: string, token: string|undefined) => {
      if (newusername && confpass) {
        if (newusername != username) {
          const findusername = await db.select().from(auth).where(eq(auth.username, username));
          const authcheck = await getAuth(token);
          if (findusername.length == 1 && authcheck.loggedin == true) {
              const usernametaken = await db.select().from(auth).where(eq(auth.username, newusername))
              if (usernametaken.length == 0) {
                const issame = await encryptCheck(confpass, findusername[0].pass);
                if (issame == true) {
                  const updateusername = await db.update(auth).set({username: newusername}).where(eq(auth.username, username));
                  return {error: "Updated username.", username: newusername};
                } else {
                    return {error: "Invalid password.", username: newusername};
                }
              } else {
                return {error: "Username is taken.", username: newusername};
              }
          } else {
              return {error: "User is not authenticated.", username: newusername};
          }
        } else {
          return {error: 'You have this username.', username: newusername};
        }
      } else {
        return {error: 'Please complete all fields.', username: newusername};
      }
    })
    var error = await checkusername(ConfirmPassword(), username(), NewUsername(), Cookies.get("auth"));
    if (error.error == 'Updated username.') { setPasswordSuccess(error.error); setPasswordError(''); setUsername(error.username) } else { setPasswordError(error.error); setPasswordSuccess('')}
    // Handle username change logic here
    console.log('Username changed:', NewUsername());
  };

  async function checkUsername() {
    let name = NewUsername();
    const isvalid = server$(async (name) => {
        const findusername = await db.select().from(auth).where(eq(auth.username, name))
        if (findusername.length == 0) {
            return true
        } else {
            return false
        }
    })
    const ret = await isvalid(name);
    if (ret == false) {
        setAvailable("ring-2 ring-red-500");
    } else {
        setAvailable("ring-2 ring-green-500");
    }
    return ret;
  }

  const buttonselect_tailwind = "bg-sky-700 text-white";
  const nonselected_tailwind = "hover:bg-gray-100 hover:text-black";
  const [showPassword, setShowPassword] = createSignal({
    pass: buttonselect_tailwind,
    username: nonselected_tailwind,
    email: nonselected_tailwind
  })
  function handleShow(type: string) {
    setPasswordError('');
    setPasswordSuccess('');
    setConfirmPassword('');
    if (type == 'pass'){
      setShowPassword({pass: buttonselect_tailwind,username: nonselected_tailwind, email: nonselected_tailwind})
    } else if (type == 'username') {
      setShowPassword({pass: nonselected_tailwind, username: buttonselect_tailwind, email: nonselected_tailwind})
    } else {
      setShowPassword({pass: nonselected_tailwind,username: nonselected_tailwind, email: buttonselect_tailwind})
    }
  }

  async function updateToggle(key: string) {
    // @ts-ignore
    setAuth('custom', key, !isauth.custom[key]);
    const updatecustom = server$(async (custom: baseauthtype["custom"], token:string|undefined) => {
      const auth_checked = await getAuth(token);
      if (auth_checked.loggedin == true) {
        await db.update(customise).set({
          dashboard: custom.dashboard,
          planner: custom.planner,
          inbox: custom.inbox,
          teams: custom.teams,
          projects: custom.projects,
          profile: custom.profile,
          settings: custom.settings
        }).where(eq(customise.username, auth_checked.user.username));
      }
    })
    await updatecustom(isauth.custom, Cookies.get("auth"));
  }

  return (
      <>
        {isauth.loggedin == true &&
         <>
            <main class="text-left mx-auto text-gray-700 p-4">
              <p class="m-2 p-2 text-4xl font-bold text-left w-full">Settings</p>
              <div class={`mt-8 p-2`}>
                <h2 class="p-2 text-lg font-medium">Change:</h2>
                <ul class="menu menu-horizontal bg-base-100 rounded-box border">
                  <li><a class={showPassword().pass} onclick={() => handleShow('pass')}>Password</a></li>
                  <li><a class={showPassword().username} onclick={() => handleShow('username')}>Username</a></li>
                  <li><a class={showPassword().email} onclick={() => handleShow('email')}>Email</a></li>
                </ul>
                { showPassword().pass != nonselected_tailwind &&
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-6">
                    <div class="p-2">
                      <label class={`block font-semibold`} for="password">
                        Confirm existing password
                      </label>
                      <input
                        type="password"
                        id="currentpassword"
                        class={`w-full p-2 border border-gray-300 rounded`}
                        value={Currentpassword()}
                        onInput={(event) => setCurrentPassword(event.target.value)}
                      />
                    </div>
                    <div class="p-2">
                      <label class={`block font-semibold`} for="password">
                        Create a new password
                      </label>
                      <input
                        type="password"
                        id="newpassword"
                        class={`w-full p-2 border border-gray-300 rounded`}
                        value={NewPassword()}
                        onInput={(event) => setNewPassword(event.target.value)}
                      />
                      <p class="text-md text-red-500 font-medium m-auto">{PasswordError()}</p>
                      <p class="text-md text-green-500 font-medium m-auto">{PasswordSuccess()}</p>
                    </div>
                    <div class="p-2">
                      <label class={`block font-semibold`} for="password">
                        Confirm new password
                      </label>
                      <input
                        type="password"
                        id="confirmpassword"
                        class={`w-full p-2 border border-gray-300 rounded`}
                        value={ConfirmPassword()}
                        onInput={(event) => setConfirmPassword(event.target.value)}
                      />
                      <button
                        class={`mt-2 px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-600`}
                        onClick={handleSubmitPassword}
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                }
                { showPassword().email != nonselected_tailwind &&
                  <div class="p-2 mt-6">
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
                      class={`mt-2 px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-600`}
                      onClick={handleSubmitEmail}
                    >
                      Confirm Email
                    </button>
                  </div>
                }
                { showPassword().username != nonselected_tailwind &&
                  <div class="grid grid-cols-1 sm:grid-cols-2 mt-6">
                    <div class="p-2">
                      <label class={`block font-semibold`} for="username">
                        Confirm existing password
                      </label>
                      <input
                        type="password"
                        id="confpass_username"
                        class={`w-full p-2 border border-gray-300 rounded`}
                        value={ConfirmPassword()}
                        onInput={(event) => setConfirmPassword(event.target.value)}
                      />
                      <p class="text-md text-red-500 font-medium m-auto">{PasswordError()}</p>
                      <p class="text-md text-green-500 font-medium m-auto">{PasswordSuccess()}</p>
                    </div>
                    <div class="p-2">
                      <label class={`block font-semibold`} for="newusername">
                        New Username
                      </label>
                      <input
                        type="username"
                        id="newusername"
                        class={isavailable() + " w-full p-2 rounded"}
                        value={NewUsername()}
                        onInput={(event) => {setNewUsername(event.target.value);checkUsername()}}
                        placeholder={username()}
                      />
                      <button
                        class={`mt-2 px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-600`}
                        onClick={handleSubmitUsername}
                      >
                        Update Username
                      </button>
                    </div>
                  </div>
                }
              </div>
              <div class="divider my-6"></div>
              <div class={`mt-8`}>
                <h2 class="p-2 text-lg font-medium">Sidebar selection:</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7">
                  <For each={Object.entries(isauth.custom)}>{([key, value]) =>
                    <label class="relative inline-flex items-center cursor-pointer mx-2 my-6">
                      <input type="checkbox" class="sr-only peer" checked={value} onchange={() => updateToggle(key)} />
                      <div class="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-700 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-sky-700"></div>
                      <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{key}</span>
                    </label>
                  }</For>
                </div>
              </div>
              <div class="divider my-6"></div> 
            </main>
         </>
       }
       {isauth.user.username == 'none ' && isauth.loggedin == false && 
        <>
          <NotLoggedIn />
        </>
       }
     </>
  );
}
