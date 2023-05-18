import { For, createResource } from "solid-js";
import server$ from "solid-start/server";

export default function Page() {
  const [student] = createResource(FetchStudents);
  return (
    <ul>
        <p>Profile</p>
        <For each={student()}>
            {(student) => <li>{student.name}</li>}
        </For>
    </ul>
  );
}

const FetchStudents = server$(async () => (await fetch("https://hogwarts.deno.dev/students")).json());

