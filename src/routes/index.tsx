import { A, useRouteData } from "solid-start";
import Counter from "~/components/Counter";
import { db } from "~/functions/db_client";
import { users } from "~/db/schema";
import { createServerData$ } from "solid-start/server";
import { For } from "solid-js";

export function routeData() {
  const allUsers = createServerData$(() => db.select().from(users));
  return allUsers;
}

export default function Home() {

  const data = useRouteData<typeof routeData>();
  
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
        Hello world!
      </h1>

      <For each={data()}>
        {(user) => <li>{user.username}</li>}
      </For>

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
    </main>
  );
}
