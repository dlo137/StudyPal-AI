// server.js  ───────────────────────────────────────────────
import express from "express";
import cors    from "cors";
import dotenv  from "dotenv";
import OpenAI  from "openai";

dotenv.config();

const PORT   = process.env.PORT || 4000;
const APIKEY = process.env.OPENAI_API_KEY;

// fail fast if no key
if (!APIKEY) {
  console.error("❌  OPENAI_API_KEY not found in .env");
  process.exit(1);
}

const app    = express();
const openai = new OpenAI({ apiKey: APIKEY });

app.use(cors());
app.use(express.json());

// ── helper: openai call with retry/back-off ───────────────
const MAX_RETRIES = 3;
async function chatWithRetry(payload, attempt = 0) {
  try {
    return await openai.chat.completions.create(payload);
  } catch (err) {
    // 429 can be rate-limit OR exhausted quota
    if (err.status === 429 && attempt < MAX_RETRIES) {
      const delay = 1000 * (attempt + 1); // 1s, 2s, 3s …
      console.warn(`⚠️  OpenAI 429 – retrying in ${delay} ms (attempt ${attempt + 1})`);
      await new Promise(r => setTimeout(r, delay));
      return chatWithRetry(payload, attempt + 1);
    }
    throw err; // re-throw after retries or other errors
  }
}

// ── health-check so / shows something ─────────────────────
app.get("/", (_, res) => {
  res.send("✅ StudyPal backend is running");
});

// ── chat endpoint ─────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    const completion = await chatWithRetry({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 512
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "";
    console.log("🔄  OpenAI reply:", reply.slice(0, 80), "…");

    res.json({ reply });
  } catch (err) {
    // Handle quota/rate-limit separately so the client knows to try later
    if (err.status === 429 || err.code === "insufficient_quota") {
      console.error("🚧  OpenAI quota / rate limit hit:", err.message);
      return res.status(503).json({ error: "AI service is temporarily unavailable. Please try again later." });
    }

    console.error("💥  /api/chat error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ── start the server ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  API up on http://localhost:${PORT}`);
});
