import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const db = await connectDB()

    const tasks = await db
      .collection("tasks")
      .find({
        userId: new ObjectId(decoded.userId),
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, priority, dueDate, category } = await request.json()
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const db = await connectDB()

    const task = {
      userId: new ObjectId(decoded.userId),
      title,
      description,
      priority: priority || "medium",
      category: category || "general",
      completed: false,
      createdAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
    }

    const result = await db.collection("tasks").insertOne(task)

    return NextResponse.json({ ...task, _id: result.insertedId })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
