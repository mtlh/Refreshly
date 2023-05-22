import { createEffect, createSignal } from 'solid-js';
import { useSession } from '~/functions/LoginHooks';

const MyComponent = () => {
  const session = useSession();
  const [loggedin, setLoggedin] = createSignal(false);
  const [user, setUser] = createSignal(session()?.user);
  if (session()?.user) {
    setLoggedin(true);
  }

  createEffect(() => {
    if (localStorage.getItem("demo") == "true") {
          setLoggedin(true);
          setUser({name: "Demo Account", email: "test@gmail.com", image:"https://avatars.githubusercontent.com/u/54061093?v=4"});
    }
  });

  function setLocal () {
    localStorage.setItem("demo", "true");
  }
  function removeLocal () {
    localStorage.removeItem("demo");
  }

  console.log(loggedin());
  return (
    <>
      <div class='p-4 bg-black'>
        <button class='p-2 text-white' onclick={setLocal}>Set</button>
        <button class='p-2 text-white' onclick={removeLocal}>Remove</button>
      </div>
      {loggedin() ? <div>TEST TRUE - {user()?.name} </div> : <div>TEST FALSE</div>}

    </>
  );
};

export default MyComponent;