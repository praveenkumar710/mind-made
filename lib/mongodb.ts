import { MongoClient, type Db } from "mongodb"
import { env, validateEnv } from "./env"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectDB(): Promise<Db> {
  if (cachedDb) {
    return cachedDb
  }

  // Validate environment variables
  validateEnv()

  if (!env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable in your .env.local file")
  }

  try {
    const client = new MongoClient(env.MONGODB_URI)
    await client.connect()

    const db = client.db("mindmate")

    cachedClient = client
    cachedDb = db

    console.log("Connected to MongoDB successfully")
    return db
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw new Error("Database connection failed")
  }
}

export async function disconnectDB() {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
  }
}
