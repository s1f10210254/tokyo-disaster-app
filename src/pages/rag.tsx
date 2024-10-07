import { useState } from "react";

export default function Rag() {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const handleUrlSubmit = async () => {
    console.log("url: ", url);
    const response = await fetch("/api/rag/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }), // URLを送信
    });

    const data = await response.json();
    setResult(data.result);
  };

  // テキスト検索
  const handleTextSearch = async () => {
    console.log("text: ", text);
    const response = await fetch("/api/rag/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    setResult(data.result);
  };

  return (
    <div>
      <h3>URL Embedding</h3>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <button onClick={handleUrlSubmit}>Embed URL</button>

      <h3>Text Search</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to search"
        rows={4}
        cols={50}
      />
      <button onClick={handleTextSearch}>Search with Text</button>

      {result && (
        <div>
          <h4>Result:</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
