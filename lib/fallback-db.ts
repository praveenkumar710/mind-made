// Fallback in-memory database for development when MongoDB connection fails
import { EventEmitter } from "events"

// Increase max listeners to avoid memory leak warnings
EventEmitter.defaultMaxListeners = 20

class InMemoryDB {
  private collections: Record<string, any[]> = {}
  private idCounter = 1

  constructor() {
    console.log("⚠️ Using in-memory database fallback (development only)")
    // Initialize with some collections
    this.collections = {
      users: [],
      tasks: [],
      otps: [],
      conversations: [],
    }
  }

  collection(name: string) {
    if (!this.collections[name]) {
      this.collections[name] = []
    }

    return {
      findOne: async (query: any) => {
        return this.collections[name].find((item) => {
          return Object.entries(query).every(([key, value]) => {
            if (key === "email" && typeof value === "string") {
              return item[key]?.toLowerCase() === value.toLowerCase()
            }
            return item[key] === value
          })
        })
      },
      find: (query: any) => {
        const results = this.collections[name].filter((item) => {
          return Object.entries(query).every(([key, value]) => {
            if (key === "userId" && value && value.toString) {
              return item[key]?.toString() === value.toString()
            }
            if (key === "createdAt" && value && value.$gte) {
              return item[key] >= value.$gte
            }
            return item[key] === value
          })
        })

        return {
          sort: () => ({
            limit: (limit: number) => results.slice(0, limit),
            toArray: async () => results,
          }),
          toArray: async () => results,
        }
      },
      insertOne: async (doc: any) => {
        const id = `mem_${this.idCounter++}`
        const insertedDoc = { ...doc, _id: id }
        this.collections[name].push(insertedDoc)
        return { insertedId: id }
      },
      updateOne: async (query: any, update: any) => {
        const index = this.collections[name].findIndex((item) => {
          return Object.entries(query).every(([key, value]) => {
            if (key === "_id" && value && value.toString) {
              return item[key]?.toString() === value.toString()
            }
            return item[key] === value
          })
        })

        if (index !== -1) {
          if (update.$set) {
            this.collections[name][index] = {
              ...this.collections[name][index],
              ...update.$set,
            }
          }
          return { matchedCount: 1, modifiedCount: 1 }
        }
        return { matchedCount: 0, modifiedCount: 0 }
      },
      deleteOne: async (query: any) => {
        const initialLength = this.collections[name].length
        this.collections[name] = this.collections[name].filter((item) => {
          return !Object.entries(query).every(([key, value]) => {
            if (key === "_id" && value && value.toString) {
              return item[key]?.toString() === value.toString()
            }
            return item[key] === value
          })
        })
        const deletedCount = initialLength - this.collections[name].length
        return { deletedCount }
      },
    }
  }

  admin() {
    return {
      ping: async () => ({ ok: 1 }),
    }
  }
}

// Singleton instance
let fallbackDb: InMemoryDB | null = null

export function getFallbackDB() {
  if (!fallbackDb) {
    fallbackDb = new InMemoryDB()
  }
  return fallbackDb
}
