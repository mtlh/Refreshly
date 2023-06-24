import Cookies from "js-cookie";
import { createEffect, createSignal } from "solid-js";
import { LoadFiles, SaveFiles, convertToBlob, parseFile } from "~/functions/uploads/FileUpload";

const Inbox = () => {
  const [files, setFiles] = createSignal<File[]>([]);

  const handleFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      await SaveFiles(await convertToBlob(files()), Cookies.get("auth")!, 0)
    }
  };

  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRemove = async (file: File) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    await SaveFiles(await convertToBlob(files()), Cookies.get("auth")!, 0)
  };


  createEffect(async () => {
    let files = await LoadFiles(Cookies.get("auth")!, 0)
    files.forEach((element: string) => {
      const file: File = parseFile(element);
      setFiles((prevFiles) => [...prevFiles, ...[file]]);
    });
  })

  return (
    <div class="container mx-auto">
      <h1 class="text-3xl font-bold mb-4">File Display</h1>
      <input type="file" class="mb-4" multiple onChange={handleFileChange} />
      {files().length > 0 && (
        <div>
          <h2 class="text-lg font-bold mb-2">Files:</h2>
          <ul class="list-disc pl-4">
            {files().map((file, index) => (
              <>
                {/* @ts-ignore */}
                <li class="text-gray-500" key={index}>
                  {file.name}
                  <button
                    class="ml-2 text-red-500"
                    onClick={() => handleRemove(file)}
                  >
                    Remove
                  </button>
                  <button
                    class="ml-2 text-blue-500"
                    onClick={() => handleDownload(file)}
                  >
                    Download
                  </button>
                </li>
              </>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Inbox;

