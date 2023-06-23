import { createSignal, onCleanup } from 'solid-js';
import { getLinkPreview } from 'link-preview-js';
import server$ from "solid-start/server";

function LinkPreview() {
  const [link, setLink] = createSignal('');
  const [previewData, setPreviewData] = createSignal(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Generate the link preview
    const data = await fetchLinkPreview(link());
    console.log(data);
    // @ts-ignore Update the previewData state
    setPreviewData(data);
  };

  const fetchLinkPreview = server$(async (link) => {

    let datareturn = {
      url: "",
      mediaType: "",
      contentType: "",
      favicons: new Array(),
      title: "",
      siteName: "",
      description: "",
      images: new Array(),
    }

    try {
      await getLinkPreview(link, {
        imagesPropertyType: "og", // fetches only open-graph images
        headers: {
          "user-agent": "googlebot", // fetches with googlebot crawler user agent
          "Accept-Language": "fr-CA", // fetches site for French language
          // ...other optional HTTP request headers
        },
        timeout: 1000
      }).then(data => {datareturn.url = data.url; datareturn.title = data.title; datareturn.siteName = data.siteName; datareturn.images = data.images; datareturn.description = data.description;});

      return datareturn;

    } catch (error) {
      console.error('Error fetching link preview:', error);
      return datareturn;
    }
  });

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={link()}
          onInput={(e) => setLink(e.target.value)}
          placeholder="Enter a link"
        />
        <button type="submit">Preview</button>
      </form>

      {previewData() && (
        <div>
          <h3>{previewData().title}</h3>
          <p>{previewData().description}</p>
          <img src={previewData().images[0]} alt="Link thumbnail" />
        </div>
      )}
    </div>
  );
}

export default LinkPreview;
