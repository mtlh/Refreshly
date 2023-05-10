import { SolidAuth, type SolidAuthConfig } from "@auth/solid-start"
import GitHub from "@auth/core/providers/github"

export const authOpts: SolidAuthConfig = {
  providers: [
    // @ts-ignore
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  debug: false,
}

export const { GET, POST } = SolidAuth(authOpts)