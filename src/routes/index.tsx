import { A } from "solid-start";
import Counter from "~/components/Counter";
import {BoardExample} from '../components/DragDrop'

import { getSession } from "@auth/solid-start"
import { createServerData$ } from "solid-start/server"
import { authOpts } from "../routes/api/[...solidAuth]"

const useSession = () => {
  return createServerData$(
    async (_, { request }) => {
      return await getSession(request, authOpts)
    },
    { key: () => ["auth_user"] }
  )
}

import { signIn, signOut } from "@auth/solid-start/client"

const login = () => signIn("github")
const logout = () => signOut()

export default function Home() {
  const session = useSession()
  const user = () => session()?.user
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
        Hello world!
      </h1>
      <Counter />
      <p class="mt-8">
        Visit{" "}
        <a
          href="https://solidjs.com"
          target="_blank"
          class="text-sky-600 hover:underline"
        >
          solidjs.com
        </a>{" "}
        to learn how to build Solid apps.
      </p>
      <p class="my-4">
        <span>Home</span>
        {" - "}
        <A href="/about" class="text-sky-600 hover:underline">
          About Page
        </A>{" "}
      </p>
      <h1>Hello world!</h1>
      {user() && <>
          <p>Logged in as {user()?.name}</p>
          <button onClick={logout}>Logout</button>
        </>
      }
      {!user() && <>
        <p>Not logged in</p>
        <button onClick={login}>Login</button>
        </>}
      <BoardExample />
    </main>
  );
}
