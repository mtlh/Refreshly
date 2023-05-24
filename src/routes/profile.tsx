import { For, createEffect, createSignal } from "solid-js";
import server$ from "solid-start/server";

export default function Page() {
  const [student, setStudent] = createSignal(null);
  createEffect(async () => {
    setStudent(await FetchStudents());
  });
  //const [test] = createResource(FetchStudents);
  return (
    <>
      <ul>
        {student() &&
          <>
            <p>Profile</p>
            <For each={student()}>
                {(student) => <li>{student.name}</li>}
            </For>
          </>
        }
      </ul>
      {/* <ul>
        <p>Profile</p>
        <For each={test()}>
            {(test) => <li>{test.name}</li>}
        </For>
      </ul> */}
    </>
  );
}

const FetchStudents = server$(async () => (await fetch("https://hogwarts.deno.dev/students")).json());

