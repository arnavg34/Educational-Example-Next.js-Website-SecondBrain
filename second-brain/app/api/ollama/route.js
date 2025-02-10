export async function POST(req) {
    try {
      const { prompt } = await req.json();
  
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3", 
          prompt,
          
        }),
      });
  
      const data = await response.json();
  
      return Response.json({ response: data.response });
    } catch (error) {
      return Response.json({ error: "Failed to connect to Ollama" }, { status: 500 });
    }
  }
  