import { createEffect, createSignal } from 'solid-js';

const MyComponent = () => {
  const [loggedin, setLoggedin] = createSignal(false);

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
      {loggedin() ? <div>TEST TRUE - </div> : <div>TEST FALSE</div>}

    </>
  );
};

export default MyComponent;