"use client";
import { useState } from "react";

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const sendPrompt = async () => {
    const res = await fetch("/api/ollama", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({prompt}),
    });

    const data = await res.json();
    setResponse(data.response);
    console.log(data.response)
  };

  return (
    <div className="p-4">
      <textarea
        className="border p-2 w-full text-black"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your prompt..."
      />
      <button onClick={sendPrompt} className="mt-2 p-2 bg-blue-500 text-black">
        Send
      </button>
      <div className="mt-4 p-2 border">{response}</div>
    </div>
  );
}
