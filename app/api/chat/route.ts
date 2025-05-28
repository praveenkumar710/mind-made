import { type NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const db = await connectDB()

    // Get user context for personalization
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })
    const recentTasks = await db
      .collection("tasks")
      .find({
        userId: new ObjectId(decoded.userId),
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })
      .limit(5)
      .toArray()

    const systemPrompt = `You are MindMate, a personal AI assistant. You help users with:
    - Daily routine suggestions and optimization
    - Task and reminder management
    - Goal tracking and motivation
    - English sentence correction
    - Code generation and programming help
    - General productivity advice

    User context:
    - Name: ${user?.name || "User"}
    - Recent tasks: ${recentTasks.map((t) => t.title).join(", ") || "None"}
    
    Be helpful, encouraging, and personalized. Keep responses concise but informative.`

    const result = await streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
    })

    // Save conversation to database
    await db.collection("conversations").insertOne({
      userId: new ObjectId(decoded.userId),
      messages: [...messages, { role: "assistant", content: await result.text }],
      createdAt: new Date(),
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
