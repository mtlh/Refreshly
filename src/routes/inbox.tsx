import { createSignal } from "solid-js";

const MyComponent = () => {
  const [files, setFiles] = createSignal<File[]>([]);

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
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

  const handleRemove = (file: File) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
  };

  const convertToFileObject = (blob: Blob, fileName: string): File => {
    return new File([blob], fileName, { type: blob.type });
  };

  const handleConvertToBlob = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log(reader.result)
      if (reader.result instanceof ArrayBuffer) {
        const blob = new Blob([reader.result], { type: file.type });
        const blobFile = convertToFileObject(blob, file.name);
        console.log("Converted to Blob:", blobFile);
      }
    };
    reader.readAsArrayBuffer(file);
  };

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
                  <button
                    class="ml-2 text-green-500"
                    onClick={() => handleConvertToBlob(file)}
                  >
                    Convert to Blob
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

export default MyComponent;
