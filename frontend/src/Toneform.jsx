import React, { useState } from "react";

function ToneForm() {
  const [text, setText] = useState("");
  const [formality, setFormality] = useState("formal");
  const [emotion, setEmotion] = useState("neutral");
  const [result, setResult] = useState("");

  // Fixed typo: removed extra 'c' from 'cconst'
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use relative path so Vercel rewrites it to Render backend
      const response = await fetch("/api/tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, formality, emotion }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.rewrittenText);
    } catch (error) {
      console.error("Error detecting tone:", error);
      setResult("⚠️ Backend not reachable. Please check your deployment.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text here"
          rows="4"
          cols="50"
        />
        <br />

        <select value={formality} onChange={(e) => setFormality(e.target.value)}>
          <option value="formal">Formal</option>
          <option value="informal">Informal</option>
        </select>

        <select value={emotion} onChange={(e) => setEmotion(e.target.value)}>
          <option value="neutral">Neutral</option>
          <option value="happy">Happy</option>
          <option value="sad">Sad</option>
        </select>

        <br />
        <button type="submit">Rewrite Tone</button>
      </form>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Rewritten Text:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

export default ToneForm;
