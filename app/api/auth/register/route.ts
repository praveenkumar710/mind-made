import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    const db = await connectDB()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const result = await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      preferences: {
        notifications: true,
        voiceEnabled: true,
        theme: "system",
      },
    })

    const token = jwt.sign({ userId: result.insertedId, email }, process.env.JWT_SECRET!, { expiresIn: "7d" })

    return NextResponse.json({
      token,
      user: {
        id: result.insertedId,
        email,
        name,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
