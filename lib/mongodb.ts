import { MongoClient, type Db } from "mongodb"
import { env } from "./env"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectDB(): Promise<Db> {
  if (cachedDb) {
    return cachedDb
  }

  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables")
  }

  try {
    console.log("🔄 Connecting to MongoDB...")

    const client = new MongoClient(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    await client.connect()

    // Test the connection
    await client.db("admin").command({ ping: 1 })

    const db = client.db("mindmate")

    cachedClient = client
    cachedDb = db

    console.log("✅ Connected to MongoDB successfully")
    return db
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error)
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function disconnectDB() {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
    console.log("🔌 Disconnected from MongoDB")
  }
}

// Health check function
export async function checkDBHealth(): Promise<boolean> {
  try {
    const db = await connectDB()
    await db.admin().ping()
    return true
  } catch (error) {
    console.error("Database health check failed:", error)
    return false
  }
}
