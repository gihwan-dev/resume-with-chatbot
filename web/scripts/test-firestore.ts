
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.resolve(__dirname, "../.env");

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const content = fs.readFileSync(ENV_PATH, "utf-8");
  const env: any = {};
  content.split("\n").forEach((line) => {
    const [key, ...values] = line.split("=");
    if (key && values.length > 0) {
      let value = values.join("=").trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      env[key.trim()] = value;
    }
  });
  return env;
}

const config = loadEnv();

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: config.PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
      privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

async function test() {
  try {
    console.log("Attempting to list collections...");
    const collections = await db.listCollections();
    console.log("Collections:", collections.map(c => c.id));
    
    console.log("Attempting to write to test_collection...");
    await db.collection("test_collection").doc("test_doc").set({ test: true });
    console.log("Write success!");
  } catch (e) {
    console.error("Firestore Error:", e);
  }
}

test();
