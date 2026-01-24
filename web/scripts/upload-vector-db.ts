
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { createVertex } from "@ai-sdk/google-vertex";
import { embed, generateText } from "ai";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

// ESM environment helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const ENV_PATH = path.resolve(__dirname, "../.env");
const DOCS_DIR = path.resolve(__dirname, "../../docs");
const HISTORY_DIR = path.resolve(__dirname, "../../collected-histories");

// 1. Load Environment Variables manually
interface EnvConfig {
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
  PUBLIC_FIREBASE_PROJECT_ID: string;
  PUBLIC_FIREBASE_DATABASE_ID?: string;
}

function loadEnv(): EnvConfig {
  if (!fs.existsSync(ENV_PATH)) {
    throw new Error(`.env file not found at ${ENV_PATH}`);
  }
  const content = fs.readFileSync(ENV_PATH, "utf-8");
  const env: any = {};
  content.split("\n").forEach((line) => {
    const [key, ...values] = line.split("=");
    if (key && values.length > 0) {
      let value = values.join("=").trim();
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      env[key.trim()] = value;
    }
  });

  if (
    !env.FIREBASE_PRIVATE_KEY ||
    !env.FIREBASE_CLIENT_EMAIL ||
    !env.PUBLIC_FIREBASE_PROJECT_ID
  ) {
    throw new Error("Missing required Firebase configuration in .env");
  }

  return env as EnvConfig;
}

const config = loadEnv();

// 2. Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: config.PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
      privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore(); // Default firestore

// 3. Initialize Vertex AI
const vertex = createVertex({
  project: config.PUBLIC_FIREBASE_PROJECT_ID,
  location: "us-central1",
  googleAuthOptions: {
    credentials: {
      client_email: config.FIREBASE_CLIENT_EMAIL,
      private_key: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
  },
});

const embeddingModel = vertex.textEmbeddingModel("text-embedding-004");
const textModel = vertex("gemini-2.0-flash");

// Types
interface KnowledgeDoc {
  content: string;
  contextualContent: string; // For embedding - includes context prefix
  title: string;
  summary: string;
  contextPrefix: string;
  skills: string[];
  techStack: string[];
  projectType: string;
  category: "docs" | "chat-history" | "code";
  sourceId: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

interface ContextualMetadata {
  title: string;
  summary: string;
  contextPrefix: string;
}

interface SkillsMetadata {
  skills: string[];
  techStack: string[];
  projectType: string;
}

// Rate limiting helper
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry helper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);
      if (attempt < maxRetries) {
        const delay = baseDelay * attempt;
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

// Generate contextual metadata (title, summary, contextPrefix) using LLM
async function generateContextualMetadata(
  content: string,
  documentContext?: string
): Promise<ContextualMetadata> {
  const contextHint = documentContext
    ? `\nDocument context: ${documentContext}`
    : "";

  const prompt = `Analyze the following content and extract metadata in JSON format.
Return ONLY a valid JSON object with these fields:
- title: A concise, descriptive title (max 50 chars)
- summary: A brief summary of the key points (max 200 chars)
- contextPrefix: A short context sentence that helps understand what this content is about (max 100 chars)
${contextHint}

Content:
${content.slice(0, 2000)}

Respond with ONLY the JSON object, no markdown code blocks or explanation.`;

  try {
    const result = await withRetry(async () => {
      const response = await generateText({
        model: textModel,
        prompt,
      });
      return response;
    });

    // Parse JSON response
    const text = result.text.trim();
    // Handle potential markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      title: String(parsed.title || "Untitled").slice(0, 50),
      summary: String(parsed.summary || "").slice(0, 200),
      contextPrefix: String(parsed.contextPrefix || "").slice(0, 100),
    };
  } catch (error) {
    console.warn("Failed to generate contextual metadata:", error);
    // Return fallback values
    return {
      title: "Untitled",
      summary: content.slice(0, 100),
      contextPrefix: "",
    };
  }
}

// Extract skills, techStack, and projectType using LLM
async function extractSkills(content: string): Promise<SkillsMetadata> {
  const prompt = `Analyze the following content and extract technical metadata in JSON format.
Return ONLY a valid JSON object with these fields:
- skills: Array of soft skills or domain expertise mentioned (max 5 items)
- techStack: Array of technologies, frameworks, languages, tools mentioned (max 10 items)
- projectType: Single string categorizing the project type (e.g., "web", "mobile", "backend", "devops", "data", "general")

Content:
${content.slice(0, 2000)}

Respond with ONLY the JSON object, no markdown code blocks or explanation.`;

  try {
    const result = await withRetry(async () => {
      const response = await generateText({
        model: textModel,
        prompt,
      });
      return response;
    });

    // Parse JSON response
    const text = result.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and sanitize arrays
    const skills = Array.isArray(parsed.skills)
      ? parsed.skills.slice(0, 5).map(String)
      : [];
    const techStack = Array.isArray(parsed.techStack)
      ? parsed.techStack.slice(0, 10).map(String)
      : [];
    const projectType =
      typeof parsed.projectType === "string" ? parsed.projectType : "general";

    return { skills, techStack, projectType };
  } catch (error) {
    console.warn("Failed to extract skills:", error);
    // Return fallback values
    return {
      skills: [],
      techStack: [],
      projectType: "general",
    };
  }
}

// Helper to create contextual content for embedding
function createContextualContent(
  contextPrefix: string,
  originalContent: string
): string {
  if (!contextPrefix) return originalContent;
  return `<context>${contextPrefix}</context>\n${originalContent}`;
}

// Generate full metadata by running both extractions in parallel
async function generateFullMetadata(
  content: string,
  documentContext?: string
): Promise<ContextualMetadata & SkillsMetadata> {
  const [contextual, skills] = await Promise.all([
    generateContextualMetadata(content, documentContext),
    extractSkills(content),
  ]);
  return { ...contextual, ...skills };
}

// 4. Processing Functions

async function processDocs() {
  console.log("Processing docs...");
  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".pdf"));
  const docs: KnowledgeDoc[] = [];

  for (const file of files) {
    const filePath = path.join(DOCS_DIR, file);
    let content = "";

    if (file.endsWith(".pdf")) {
      const dataBuffer = fs.readFileSync(filePath);
      const uint8Array = new Uint8Array(dataBuffer);
      const pdfInstance = new PDFParse(uint8Array);
      const pdfResult = await pdfInstance.getText();
      content = pdfResult.text;
    } else {
      content = fs.readFileSync(filePath, "utf-8");
    }

    // Split by markdown headers
    const chunks = content.split(/\n#{1,3} /);
    const documentContext = `Source file: ${file}`;

    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      if (chunk.trim().length < 50) continue; // Skip small chunks

      console.log(`  Processing doc chunk ${index + 1}/${chunks.length} from ${file}...`);

      // Generate full metadata using LLM
      const metadata = await generateFullMetadata(chunk.trim(), documentContext);

      // Create contextual content for embedding
      const contextualContent = createContextualContent(
        metadata.contextPrefix,
        chunk.trim()
      );

      docs.push({
        content: chunk.trim(),
        contextualContent,
        title: metadata.title,
        summary: metadata.summary,
        contextPrefix: metadata.contextPrefix,
        skills: metadata.skills,
        techStack: metadata.techStack,
        projectType: metadata.projectType,
        category: "docs",
        sourceId: file,
        createdAt: new Date(),
        metadata: { fileName: file },
      });

      // Rate limiting for metadata generation
      await sleep(500);
    }
  }
  return docs;
}

async function processChatHistory() {
  console.log("Processing chat history...");
  // Look for the new format files
  const files = fs
    .readdirSync(HISTORY_DIR)
    .filter((f) => f.startsWith("all-portfolio") && f.endsWith(".json"));

  // First pass: collect all raw conversation items
  interface RawConversation {
    content: string;
    sourceId: string;
    createdAt: Date;
    fileName: string;
  }
  const rawItems: RawConversation[] = [];

  for (const file of files) {
    const filePath = path.join(HISTORY_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Check if it's the new format with conversations
    if (data.conversations && Array.isArray(data.conversations)) {
      data.conversations.forEach((conv: any, index: number) => {
        const userQuery = conv.user;
        const assistantResponse = conv.assistant;

        if (!userQuery && !assistantResponse) return;

        let content = "";
        if (userQuery) content += `**User**: ${userQuery}\n`;
        if (assistantResponse) content += `**Assistant**: ${assistantResponse}`;

        rawItems.push({
          content: content.trim(),
          sourceId: `conv-${index}`,
          createdAt: new Date(conv.timestamp || Date.now()),
          fileName: file,
        });
      });
    } else if (data.sessions) {
      // Fallback to old format (just in case)
      for (const session of data.sessions) {
        const messages = session.messages;
        if (!messages || messages.length === 0) continue;

        let currentPair = "";

        for (let i = 0; i < messages.length; i++) {
          const msg = messages[i];
          const role = msg.role === "user" ? "User" : "Assistant";
          const msgContent =
            typeof msg.content === "string"
              ? msg.content
              : JSON.stringify(msg.content);

          currentPair += `\n**${role}**: ${msgContent}`;

          if (msg.role === "assistant" || currentPair.length > 2000) {
            rawItems.push({
              content: currentPair.trim(),
              sourceId: session.sessionId,
              createdAt: new Date(msg.timestamp || Date.now()),
              fileName: file,
            });
            currentPair = "";
          }
        }
      }
    }
  }

  console.log(`Found ${rawItems.length} chat conversations to process...`);

  // Second pass: process in batches with metadata generation
  const docs: KnowledgeDoc[] = [];
  const BATCH_SIZE = 5;
  const documentContext = "Portfolio chatbot conversation history";

  for (let i = 0; i < rawItems.length; i += BATCH_SIZE) {
    const batch = rawItems.slice(i, i + BATCH_SIZE);
    console.log(
      `  Processing chat batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rawItems.length / BATCH_SIZE)}...`
    );

    // Process batch in parallel
    const processedBatch = await Promise.all(
      batch.map(async (item) => {
        const metadata = await generateFullMetadata(item.content, documentContext);
        const contextualContent = createContextualContent(
          metadata.contextPrefix,
          item.content
        );

        return {
          content: item.content,
          contextualContent,
          title: metadata.title,
          summary: metadata.summary,
          contextPrefix: metadata.contextPrefix,
          skills: metadata.skills,
          techStack: metadata.techStack,
          projectType: metadata.projectType,
          category: "chat-history" as const,
          sourceId: item.sourceId,
          createdAt: item.createdAt,
          metadata: { fileName: item.fileName },
        };
      })
    );

    docs.push(...processedBatch);

    // Rate limiting between batches
    if (i + BATCH_SIZE < rawItems.length) {
      await sleep(1000);
    }
  }

  return docs;
}

// 5. Embedding & Upload Helper
async function uploadBatch(docs: KnowledgeDoc[]) {
  const collectionRef = db.collection("knowledge_base");
  const BATCH_SIZE = 10; // Embed in small batches to avoid rate limits

  console.log(`Starting upload for ${docs.length} documents...`);

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batchDocs = docs.slice(i, i + BATCH_SIZE);

    try {
      // Generate embeddings in parallel using contextualContent
      const processedDocs = await Promise.all(
        batchDocs.map(async (doc) => {
          // Use contextualContent for embedding (includes context prefix)
          const embeddingContent = doc.contextualContent || doc.content;
          const { embedding } = await embed({
            model: embeddingModel,
            value: embeddingContent,
          });

          return {
            // Store all fields
            content: doc.content,
            contextualContent: doc.contextualContent,
            title: doc.title,
            summary: doc.summary,
            contextPrefix: doc.contextPrefix,
            skills: doc.skills,
            techStack: doc.techStack,
            projectType: doc.projectType,
            category: doc.category,
            sourceId: doc.sourceId,
            createdAt: doc.createdAt,
            metadata: doc.metadata,
            embedding_field: FieldValue.vector(embedding),
          };
        })
      );

      // Write to Firestore
      const batch = db.batch();
      processedDocs.forEach((doc) => {
        const docRef = collectionRef.doc(); // Auto-ID
        batch.set(docRef, doc);
      });

      await batch.commit();
      console.log(
        `Uploaded batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(docs.length / BATCH_SIZE)} (${batchDocs.length} items)`
      );

      // Basic rate limiting
      await sleep(500);
    } catch (error) {
      console.error(`Error in batch starting at index ${i}:`, error);
    }
  }
  console.log("Upload complete!");
}

async function clearCollection() {
    console.log("Clearing existing knowledge_base collection...");
    const collectionRef = db.collection("knowledge_base");
    const snapshot = await collectionRef.get();
    
    if (snapshot.empty) {
        console.log("Collection is already empty.");
        return;
    }
    
    const BATCH_SIZE = 500;
    const docs = snapshot.docs;
    
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = db.batch();
        const batchDocs = docs.slice(i, i + BATCH_SIZE);
        
        batchDocs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`Deleted batch ${i / BATCH_SIZE + 1} (${batchDocs.length} items)`);
    }
    console.log("Collection cleared.");
}

// Main Execution
async function main() {
  try {
    await clearCollection();

    const docItems = await processDocs();
    const chatItems = await processChatHistory();
    
    const allItems = [...docItems, ...chatItems];
    console.log(`Found ${docItems.length} doc chunks and ${chatItems.length} chat chunks.`);
    
    if (allItems.length > 0) {
      await uploadBatch(allItems);
    } else {
      console.log("No content found to upload.");
    }

  } catch (e) {
    console.error("Script execution failed:", e);
    process.exit(1);
  }
}

main();
