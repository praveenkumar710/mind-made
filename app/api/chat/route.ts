import { type NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const { messages, provider = "auto" } = await request.json()
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as any
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await connectDB()

    // Get user context for personalization
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

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

    // Choose AI model based on availability and preference
    let model
    let selectedProvider = provider

    if (provider === "grok" && env.XAI_API_KEY) {
      model = xai("grok-2-1212")
      selectedProvider = "grok"
    } else if (provider === "openai" && env.OPENAI_API_KEY) {
      model = openai("gpt-4o")
      selectedProvider = "openai"
    } else if (provider === "auto") {
      // Auto-select based on availability
      if (env.OPENAI_API_KEY) {
        model = openai("gpt-4o")
        selectedProvider = "openai"
      } else if (env.XAI_API_KEY) {
        model = xai("grok-2-1212")
        selectedProvider = "grok"
      } else {
        return NextResponse.json(
          {
            error: "No AI provider configured. Please add OPENAI_API_KEY or XAI_API_KEY to your environment variables.",
          },
          { status: 500 },
        )
      }
    } else {
      return NextResponse.json(
        {
          error: `AI provider '${provider}' is not available or not configured.`,
        },
        { status: 500 },
      )
    }

    console.log(`🤖 Using AI provider: ${selectedProvider}`)

    const result = await streamText({
      model,
      system: systemPrompt,
      messages,
      maxTokens: 1000,
      temperature: 0.7,
    })

    // Save conversation to database (don't await to avoid blocking response)
    db.collection("conversations")
      .insertOne({
        userId: new ObjectId(decoded.userId),
        messages: [...messages],
        provider: selectedProvider,
        createdAt: new Date(),
      })
      .catch((error) => console.error("Failed to save conversation:", error))

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
