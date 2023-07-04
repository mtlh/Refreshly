import { useNavigate } from "solid-start";

const NotLoggedInComponent = () => {
    const nav = useNavigate();
    return (
        <div class="flex flex-col items-center justify-center h-screen">
        <p class="text-2xl text-gray-800">User is not logged in</p>
        <button
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-sky-800"
            onClick={() => nav("/")}
        >
            Go to Home
        </button>
        </div>
    );
};
  
  export default NotLoggedInComponent;