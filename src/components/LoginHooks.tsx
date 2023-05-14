import { getSession } from "@auth/solid-start"
import { createServerData$ } from "solid-start/server"
import { authOpts } from "../routes/api/[...solidAuth]"

export const useSession = () => {
  return createServerData$(
    async (_, { request }) => {
      return await getSession(request, authOpts)
    },
    { key: () => ["auth_user"] }
  )
}

import { signIn, signOut } from "@auth/solid-start/client"

export const login = () => signIn("github")
export const logout = () => signOut()