import React, { useState } from "react";
import axios from "axios";

function ToneForm() {
  const [text, setText] = useState("");
  const [formality, setFormality] = useState("formal");
  const [emotion, setEmotion] = useState("neutral");
  const [result, setResult] = useState("");

  cconst handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, formality, emotion }),
      });
  
      if (!response.ok) {
        throw new Error("Server not responding");
      }
  
      const data = await response.json();
      setResult(data.rewrittenText);
    } catch (error) {
      console.error("Error:", error);
      setResult("⚠️ Backend not running. Please start server.");
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
