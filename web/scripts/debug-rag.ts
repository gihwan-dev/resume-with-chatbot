/**
 * RAG Debug Script
 *
 * Local script to test vector search and debug RAG agent behavior.
 * Run with: npx tsx scripts/debug-rag.ts
 */

import { createVertex } from "@ai-sdk/google-vertex"
import { embed } from "ai"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, FieldValue } from "firebase-admin/firestore"
import dotenv from "dotenv"
import path from "path"

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

interface VectorResult {
  title?: string
  content: string
  category?: string
  skills?: string[]
  techStack?: string[]
  projectType?: string
  vector_distance?: number
}

async function main() {
  console.log("=".repeat(60))
  console.log("RAG Debug Script")
  console.log("=".repeat(60))

  // Initialize Firebase Admin
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const projectId = process.env.PUBLIC_FIREBASE_PROJECT_ID

  if (!privateKey || !clientEmail || !projectId) {
    console.error("Missing Firebase credentials in environment variables")
    console.error(
      "Required: FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, PUBLIC_FIREBASE_PROJECT_ID"
    )
    process.exit(1)
  }

  // Initialize Firebase if not already initialized
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    })
  }

  const db = getFirestore()

  // Initialize Vertex AI
  const vertex = createVertex({
    project: projectId,
    location: "us-central1",
    googleAuthOptions: {
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
    },
  })

  // Test query
  const testQuery = process.argv[2] || "기술 스택이 뭔가요?"

  console.log(`\nTest Query: "${testQuery}"`)
  console.log("-".repeat(60))

  try {
    // Generate embedding
    console.log("\n1. Generating embedding...")
    const { embedding } = await embed({
      model: vertex.embeddingModel("text-embedding-004"),
      value: testQuery,
    })
    console.log(`   Embedding dimension: ${embedding.length}`)

    // Perform vector search
    console.log("\n2. Performing vector search...")
    const knowledgeBaseRef = db.collection("knowledge_base")
    const vectorQuery = knowledgeBaseRef.findNearest(
      "embedding_field",
      FieldValue.vector(embedding),
      {
        limit: 10,
        distanceMeasure: "COSINE",
        distanceResultField: "vector_distance",
      } as {
        limit: number
        distanceMeasure: "COSINE"
        distanceResultField?: string
      }
    )

    const snapshot = await vectorQuery.get()
    console.log(`   Found ${snapshot.size} documents`)

    // Analyze results
    console.log("\n3. Analyzing results...")
    console.log("-".repeat(60))

    let hasVectorDistance = false
    const results: Array<{
      id: string
      title: string
      distance: number | undefined
      similarity: number
      hasDistance: boolean
    }> = []

    snapshot.forEach((doc) => {
      const data = doc.data() as VectorResult
      const distance = data.vector_distance
      const hasDistance = distance !== undefined && distance !== null

      if (hasDistance) {
        hasVectorDistance = true
      }

      const similarity = hasDistance ? 1 - (distance as number) : 1

      results.push({
        id: doc.id,
        title: data.title || "No title",
        distance,
        similarity,
        hasDistance,
      })
    })

    // Print results table
    console.log("\n   Results:")
    console.log(
      "   " +
        "ID".padEnd(25) +
        "Title".padEnd(30) +
        "Distance".padEnd(12) +
        "Similarity"
    )
    console.log("   " + "-".repeat(80))

    for (const r of results) {
      const distStr = r.hasDistance
        ? (r.distance as number).toFixed(4)
        : "N/A"
      const simStr = r.similarity.toFixed(4)
      console.log(
        `   ${r.id.slice(0, 23).padEnd(25)}${r.title.slice(0, 28).padEnd(30)}${distStr.padEnd(12)}${simStr}`
      )
    }

    // Diagnosis
    console.log("\n" + "=".repeat(60))
    console.log("DIAGNOSIS")
    console.log("=".repeat(60))

    if (!hasVectorDistance) {
      console.log("\n⚠️  WARNING: vector_distance is NOT being returned!")
      console.log("   All similarities will default to 1.0")
      console.log("")
      console.log("   Possible causes:")
      console.log(
        "   - Firestore findNearest may not support distanceResultField"
      )
      console.log("   - Check firebase-admin SDK version (needs 13.x+)")
      console.log("   - Verify the index is created correctly")
    } else {
      console.log("\n✅ vector_distance is being returned correctly!")
      console.log(`   Distance range: ${results[0]?.distance?.toFixed(4)} - ${results[results.length - 1]?.distance?.toFixed(4)}`)
    }

    // Check for all 1.0 similarities
    const allMaxSimilarity = results.every((r) => r.similarity >= 0.99)
    if (allMaxSimilarity && results.length > 1) {
      console.log("\n⚠️  WARNING: All similarities are ~1.0!")
      console.log(
        "   This suggests vector_distance is not working properly."
      )
    }
  } catch (error) {
    console.error("\n❌ Error:", error)
  }
}

main().catch(console.error)
