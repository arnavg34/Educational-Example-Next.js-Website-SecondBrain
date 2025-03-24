"use client";
import { useState, useRef, useEffect } from "react";

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileContent, setFileContent] = useState(null);
  const [fileName, setFileName] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const addMessage = (role, content) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type === "application/pdf") {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/process-file", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("File processing failed");

        const data = await response.json();
        setFileContent(data.content);
        addMessage("system", `PDF "${file.name}" has been processed and loaded.`);
      } catch (error) {
        console.error("Error processing PDF:", error);
        addMessage("system", "Error processing the PDF file.");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setFileContent(content);
        addMessage("system", `File "${file.name}" has been loaded for context.`);
      };
      reader.readAsText(file);
    }
  };

  const sendPrompt = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    addMessage("user", prompt);

    try {
      const requestBody = {
        prompt,
        fileContent: fileContent || null,
        fileName: fileName || null,
      };

      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      addMessage("assistant", data.response);
      setPrompt("");
    } catch (error) {
      console.error("Error:", error);
      addMessage("system", "Error getting response from the AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFileContext = () => {
    setFileContent(null);
    setFileName("");
    addMessage("system", "File context has been cleared.");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ollama Chat</h1>

      {/* File upload section */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded border p-2 hover:bg-gray-50">
            📁 <span>Upload File</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".txt,.pdf,.md"
            />
          </label>
        </div>

        {fileName && (
          <div className="mt-2 bg-blue-50 p-2 rounded flex justify-between items-center">
            <span className="font-medium text-black">Using file: {fileName}</span>
            <button
              onClick={clearFileContext}
              className="text-red-600 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Chat window */}
      <div className="border rounded p-2 h-80 overflow-y-auto mb-4 bg-white">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded text-black ${
              msg.role === "user"
                ? "bg-blue-100 text-right ml-8"
                : msg.role === "assistant"
                ? "bg-gray-200 text-left mr-8"
                : "text-center italic text-gray-600"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input section */}
      <div className="flex flex-col gap-2">
        <textarea
          className="border p-2 w-full rounded text-black"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your prompt..."
          rows={3}
          disabled={isLoading}
        />
        <button
          onClick={sendPrompt}
          className="p-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Send"}
        </button>
      </div>
    </div>
  );
}
