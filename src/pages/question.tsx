import { useState } from "react";

export default function Question() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [references, setReferences] = useState<
    { url: string; score: string; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    console.log("query: ", query);
    const response = await fetch("/api/rag/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    setResult(data.answer);
    setReferences(data.references); // 参照情報とスコアを保存
    setLoading(false);
  };

  const handleWeb = async () => {
    await fetch("/api/rag/embedding");
  };

  return (
    <div>
      <h1>Ask a Question</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your question"
        style={{
          width: "80%",
          padding: "10px",
          //   fontSize: "1.5em",
          marginBottom: "20px",
        }}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Loading..." : "Submit"}
      </button>
      {result && (
        <div>
          <h2>Answer</h2>
          <p>{result}</p>
        </div>
      )}

      {/* {references.length > 0 && (
        <div>
          <h2>References</h2>
          <ul>
            {references.map((ref, index) => (
              <li key={index}>
                <strong>URL:</strong> <a href={ref.url}>{ref.url}</a> <br />
                <strong>Score:</strong> {ref.score} <br />
                <strong>Text:</strong> <p>{ref.text}</p>{" "}
              </li>
            ))}
          </ul>
        </div>
      )} */}
      {/* <button onClick={handleWeb}>Embed URL</button> */}
    </div>
  );
}
