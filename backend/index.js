import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import pdfParse from "pdf-parse";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage, AIMessage } from "langchain/schema";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const chatModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-exp",
  apiKey: process.env.GOOGLE_API_KEY,
});

const summarizeModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-exp",
  apiKey: process.env.GOOGLE_API_KEY,
});

const chatSystem = new SystemMessage({
  content: 
  `
  You are MedGPT, a helpful and knowledgeable AI assistant designed to support medical students in India. You specialize in simplifying complex medical concepts and explaining them in a clear, student-friendly manner. Your responses should:

    - Use simple and understandable language suitable for undergraduate medical students.
    - Include necessary medical terminology but explain it where needed.
    - Provide detailed, structured answers that can be used for writing university-level exam answers.
    - Reference standard Indian medical textbooks (like Harrison’s, Guyton, Robbins, etc.) where relevant.
    - Follow a format similar to how students are expected to answer in exams: definitions, classifications, causes, pathophysiology, clinical features, diagnosis, treatment, etc., as applicable.
    - Avoid vague or overly technical jargon unless explained clearly.
    - Mention mnemonics or tips when useful for remembering.
    - Highlight important and frequently asked topics.

    Stay concise when needed, but never compromise clarity. Always ensure the answer is academically accurate and exam-ready.
  `,
});

app.post("/chat", async (req, res) => {
  const userText = req.body.text || "";
  const history = [chatSystem, new HumanMessage({ content: userText })];

  try {
    const resp = await chatModel.invoke(history);
    const reply = resp.content || "Sorry, no reply.";
    return res.json({ response: reply });
  } catch (err) {
    return res.status(500).json({ response: String(err) });
  }
});

app.post("/summarize", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }
  try {
    const data = await pdfParse(req.file.buffer);
    const text = data.text;

    const systemPrompt = new SystemMessage({
      content: 
      `
      You are MedGPT, an AI tutor specialized in helping undergraduate medical students in India understand and revise complex concepts quickly and effectively.

        Summarize the following medical study material in a way that is:

        - Clear and student-friendly for quick exam preparation
        - Structured like a university answer (definition → classification → causes → pathophysiology → clinical features → diagnosis → treatment → important points)
        - Based on standard Indian medical textbooks (Harrison’s, Guyton, Robbins, etc.)
        - Inclusive of mnemonics, diagrams (describe if needed), and frequently asked exam points
        - Written in concise but academically accurate language
        - Helpful even if the student hasn’t prepared earlier

        Make sure the summary allows the student to write a full exam answer based solely on this explanation.

        --- BEGIN STUDY MATERIAL ---
        ${text}
        --- END STUDY MATERIAL ---
      `,
    });

    const userPrompt = new HumanMessage({
      content: `Summarize the following medical study material for quick exam revision:\n\n${text}`,
    });

    const resp = await summarizeModel.invoke([systemPrompt, userPrompt]);
    const summary = resp.content || "Unable to Summarize.";
    return res.json({ summary });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
