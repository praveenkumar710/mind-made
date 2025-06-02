import { MongoClient, type Db } from "mongodb"
import { env } from "./env"
import { getFallbackDB } from "./fallback-db"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null
let usingFallback = false

export async function connectDB(): Promise<any> {
  if (cachedDb) {
    return cachedDb
  }

  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables")
  }

  try {
    console.log("🔄 Connecting to MongoDB...")
    console.log("MongoDB URI format check:", env.MONGODB_URI.substring(0, 20) + "...")

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
    usingFallback = false

    console.log("✅ Connected to MongoDB successfully")
    return db
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error)

    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes("EBADNAME")) {
        console.error("❌ Invalid MongoDB URI format. Check for special characters in username/password.")
      } else if (error.message.includes("ENOTFOUND")) {
        console.error("❌ MongoDB host not found. Check your cluster address.")
      } else if (error.message.includes("Authentication failed")) {
        console.error("❌ MongoDB authentication failed. Check username and password.")
      }
    }

    // In development, use fallback in-memory database
    if (env.NODE_ENV === "development") {
      console.log("⚠️ Using in-memory database fallback for development")
      usingFallback = true
      cachedDb = getFallbackDB()
      return cachedDb
    }

    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function disconnectDB() {
  if (cachedClient && !usingFallback) {
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
    if (usingFallback) {
      return true // Fallback is always "healthy"
    }
    await db.admin().ping()
    return true
  } catch (error) {
    console.error("Database health check failed:", error)
    return false
  }
}

// Check if using fallback
export function isUsingFallbackDB(): boolean {
  return usingFallback
}
