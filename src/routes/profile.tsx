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
  const currenttime = new Date().toUTCString();
  const [isauth, setAuth] = createStore(base_noauth);
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

  return (
      <>
        {isauth.loggedin == true &&
         <>
            <div class={`mx-auto p-4`}>
              <div class={`items-center space-y-4 flex`}>
                <img
                  src={isauth.user.imgurl}// Replace with actual profile picture URL
                  alt="Profile Picture"
                  class={`w-32 h-32 rounded-full mr-6`}
                />
                <div class="my-auto">
                  <h2 class={`text-2xl font-bold`}>{username()}</h2>
                  <h2 class={`text-xl font-medium`}>{email()}</h2>
                  <h2 class={`text-lg font-normal`}>{createdAt()}</h2>
                </div>
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
