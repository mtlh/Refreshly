import Cookies from "js-cookie";
import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate } from "solid-start";
import NotLoggedIn from "~/components/NotLoggedIn";
import { getAuth } from "~/functions/getAuth";
import { createSignal } from 'solid-js';
import { base_noauth } from "~/functions/db_config";
import { GetAvatar, UploadAvatar, base64ToBlob, parseAvatar, validateFile } from "~/functions/uploads/Avatar";

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

    const dataUrl = parseAvatar(await GetAvatar(Cookies.get("auth")!));
    if (dataUrl) {
      // @ts-ignore
      setImageUrl(dataUrl);
    }
  });

  const [file, setFile] = createSignal(null);
  const [imageUrl, setImageUrl] = createSignal("");

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    if (validateFile(file())) {
      convertToBlob(selectedFile);
    } else {}
  };

  const convertToBlob = async (file: any) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const fileString = reader.result;
        // @ts-ignore
        const isuploaded = await UploadAvatar(fileString, Cookies.get("auth")!);
        if (isuploaded) {
          const imageUrl = parseAvatar(await GetAvatar(Cookies.get("auth")!));
          // @ts-ignore
          setImageUrl(imageUrl);
        } else {
          setFile(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
      <>
        {isauth.loggedin == true &&
         <>
            <div class={`mx-auto p-4`}>
              <div class={`items-center mb-6 flex`}>
                {imageUrl() ?
                  <img
                    src={imageUrl()}
                    alt="Profile Picture"
                    class={`w-40 h-40 rounded-full mr-6`}
                    style={{ "max-width": '100%', "max-height": '100%', "object-fit": 'contain' }} 
                  />
                  :
                  <img
                    src={isauth.user.imgurl}
                    alt="Profile Picture"
                    class={`w-40 h-40 rounded-full mr-6`}
                    style={{ "max-width": '100%', "max-height": '100%', "object-fit": 'contain' }} 
                  />
                }
                <div class="my-auto">
                  <h2 class={`text-4xl font-bold capitalize`}>{username()}</h2>
                  <h2 class={`text-xl font-medium`}>{email()}</h2>
                  <h2 class={`text-lg font-normal`}>{createdAt()}</h2>
                </div>
              </div>
              <label class="block my-2 text-md font-medium text-gray-900 dark:text-white" for="file_input">Update avatar</label>
              <input onChange={handleFileChange} 
                class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none"
                aria-describedby="file_input_help" id="file_input" type="file"
                accept=".svg, .png, .jpg, .jpeg, .gif" />
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
              {file() && !validateFile(file()) && <p class="text-red-700">Please select a valid file (SVG, PNG, JPG, GIF) within the specified size limit.</p>}
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
