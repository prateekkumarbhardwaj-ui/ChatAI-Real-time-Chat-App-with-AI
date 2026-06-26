const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const aiChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: "Message required" });

    const messages = [
      { role: "system", content: "You are a helpful AI assistant in a chat app." },
      ...history.map(h => ({ role: h.role === "assistant" ? "assistant" : "user", content: h.text })),
      { role: "user", content: message }
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 500,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("AI error:", error);
    res.status(500).json({ message: "AI error: " + error.message });
  }
};

const summarizeChat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ message: "Messages required" });
    const chatText = messages.map(m => `${m.sender?.name || "User"}: ${m.content}`).join("\n");

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: `Summarize this chat in 3-4 bullet points:\n\n${chatText}` }],
    });

    res.json({ summary: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: "AI error: " + error.message });
  }
};

const suggestReplies = async (req, res) => {
  try {
    const { lastMessage } = req.body;
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: `Given: "${lastMessage}", give 3 short casual reply suggestions. Return JSON array only. Example: ["Sure!", "Got it!", "Sounds good!"]` }],
    });
    const text = response.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, "").trim();
    res.json({ suggestions: JSON.parse(cleaned) });
  } catch (error) {
    res.status(500).json({ suggestions: ["Sure!", "Got it!", "Let me check"] });
  }
};

module.exports = { aiChat, summarizeChat, suggestReplies };