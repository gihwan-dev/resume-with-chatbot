import { type App, cert, getApps, initializeApp } from "firebase-admin/app"
import { type Firestore, getFirestore } from "firebase-admin/firestore"

let app: App
let db: Firestore

const privateKey = import.meta.env.FIREBASE_PRIVATE_KEY
const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL
const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID

if (!getApps().length) {
  if (privateKey && clientEmail) {
    try {
      const formattedPrivateKey = privateKey.replace(/\\n/g, "\n")
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
      })
    } catch (e) {
      console.error("Failed to initialize Firebase with env vars", e)
      app = initializeApp()
    }
  } else {
    app = initializeApp()
  }
} else {
  app = getApps()[0]
}

const databaseId = import.meta.env.PUBLIC_FIREBASE_DATABASE_ID
if (databaseId) {
  db = getFirestore(app, databaseId)
} else {
  db = getFirestore(app)
}

export { app, db }
