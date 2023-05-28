import Cookies from "js-cookie";
import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate } from "solid-start";
import NotLoggedIn from "~/components/NotLoggedIn";
import { getAuth } from "~/functions/getAuth";
import { createSignal } from 'solid-js';
import server$ from "solid-start/server";
import { db } from "~/functions/db_client";
import { eq } from "drizzle-orm";
import { auth } from "~/db/schema";
import { encrypt, encryptCheck } from "~/functions/encrypt";

export default function SettingsPage() {
  const currenttime = new Date().toUTCString();
  const [isauth, setAuth] = createStore({
    loggedin: false,
    user: {
      username: "",
      displayname: "",
      email: "",
      imgurl: "",
      created: ""
    }
  });

  const [Currentpassword, setCurrentPassword] = createSignal('');
  const [NewPassword, setNewPassword] = createSignal('');
  const [ConfirmPassword, setConfirmPassword] = createSignal('');
  const [PasswordError, setPasswordError] = createSignal('');
  const [PasswordSuccess, setPasswordSuccess] = createSignal('');

  const [NewUsername, setNewUsername] = createSignal('');
  const [isavailable, setAvailable] = createSignal("ring-2 ring-green-500");

  const [email, setEmail] = createSignal(isauth.user.email);
  const [username, setUsername] = createSignal(isauth.user.username);
  const [createdAt, setCreatedAt] = createSignal(currenttime);

  const nav = useNavigate();
  //const [auth] = createResource(getAuth);
  createEffect(async () => {
    setAuth(await getAuth(Cookies.get("auth")));
    if (isauth.loggedin == false) {nav("/login")};
    setUsername(isauth.user.username);
    setEmail(isauth.user.email);
    setCreatedAt(isauth.user.created);
  });

  const handleSubmitPassword = async () => {
    setPasswordError('');setPasswordSuccess('');
    const checkpassword = server$(async (oldpass: string, newpass: string, confpass: string, username: string) => {
      if (oldpass && newpass && confpass) {
        if (newpass == confpass) {
          const findusername = await db.select().from(auth).where(eq(auth.username, username))
          if (findusername.length == 1) {
              const issame = await encryptCheck(oldpass, findusername[0].pass);
              if (issame == true) {
                const updatetoken = await db.update(auth).set({pass: await encrypt(newpass)}).where(eq(auth.username, username)); 
                return "Updated password.";
              } else {
                  return "Invalid password.";
              }
          } else {
              return "User not found.";
          }
        } else {
          return 'New and confirmation passwords do not match.';
        }
      } else {
        return 'Please complete all fields.'
      }
    })
    var error: string = await checkpassword(Currentpassword(), NewPassword(), ConfirmPassword(), username());
    if (error == 'Updated password.') { setPasswordSuccess(error); setPasswordError('') } else { setPasswordError(error); setPasswordSuccess('')}
  };

  const handleSubmitEmail = () => {
    // Handle email change logic here
    console.log('Email changed:', email());
  };

  const handleSubmitUsername = async () => {
    setPasswordError('');setPasswordSuccess('');
    const checkusername = server$(async (confpass: string, username: string, newusername: string) => {
      if (newusername && confpass) {
        if (newusername != username) {
          const findusername = await db.select().from(auth).where(eq(auth.username, username))
          if (findusername.length == 1) {
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
              return {error: "User not found.", username: newusername};
          }
        } else {
          return {error: 'You have this username.', username: newusername};
        }
      } else {
        return {error: 'Please complete all fields.', username: newusername};
      }
    })
    var error = await checkusername(ConfirmPassword(), username(), NewUsername());
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

  const buttonselect_tailwind = "bg-sky-800 text-white";
  const [showPassword, setShowPassword] = createSignal({
    pass: buttonselect_tailwind,
    username: "",
    email: ""
  })
  function handleShow(type: string) {
      if (type == 'pass'){
        setShowPassword({pass: buttonselect_tailwind,username: "",email: ""})
      } else if (type == 'username') {
        setShowPassword({pass: "",username: buttonselect_tailwind,email: ""})
      } else {
        setShowPassword({pass: "",username: "",email: buttonselect_tailwind})
      }
  }
  return (
      <>
        {isauth.loggedin == true &&
         <>
            <div class={`max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-6xl mx-auto p-4`}>
              <div class={`items-center space-y-4 flex`}>
                <img
                  src={isauth.user.imgurl}// Replace with actual profile picture URL
                  alt="Profile Picture"
                  class={`w-32 h-32 rounded-full mr-6`}
                />
                <div class="my-auto">
                  <h2 class={`text-2xl font-bold`}>{username()}</h2>
                  <h2 class={`text-lg font-medium`}>{createdAt()}</h2>
                </div>
              </div>
              <div class={`mt-8`}>
                <ul class="menu menu-horizontal bg-base-100 rounded-box border">
                  <li><a class={showPassword().pass} onclick={() => handleShow('pass')}>Password</a></li>
                  <li><a class={showPassword().username} onclick={() => handleShow('username')}>Username</a></li>
                  <li><a class={showPassword().email} onclick={() => handleShow('email')}>Email</a></li>
                </ul>
                { showPassword().pass != "" &&
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
                { showPassword().email != "" &&
                  <div class="p-2">
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
                { showPassword().username != "" &&
                  <div class="grid grid-cols-1 sm:grid-cols-2">
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
            </div>
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
