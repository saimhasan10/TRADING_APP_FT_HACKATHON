import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error("Failed to init Gemini client:", e);
    }
  }
  return aiClient;
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "MacroBex Simulation API" });
});

app.post("/api/ai/explain", async (req, res) => {
  try {
    const { question, context, userPrompt } = req.body;
    const client = getAIClient();
    if (!client) {
      return res.status(200).json({
        ok: false,
        error: "AI assistance is temporarily unavailable."
      });
    }

    const query = question || userPrompt || "Explain current state";
    const promptText = `You are the MacroBex AI Assistant for a safe simulated trading platform.
Your mandate:
1. Explain the current application state based strictly on provided facts.
2. Emphasize: Simulation only — no real money, live broker execution, or production identity verification.
3. Be transparent, accurate, and professional. Mention exact ledger balance, reserved balance, available balance, transaction IDs, or evidence flags when present.
4. If facts or evidence are missing, state clearly that they are missing instead of hallucinating.
5. AI must never approve funds, bypass permissions, or alter balances.

User Question: ${query}

Current Evidence & State:
${JSON.stringify(context || {}, null, 2)}
`;

    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
    });

    return res.json({
      ok: true,
      text: response.text || "No explanation returned."
    });
  } catch (error: any) {
    console.error("AI generation failed:", error);
    return res.status(200).json({
      ok: false,
      error: "AI assistance is temporarily unavailable."
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MacroBex server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
