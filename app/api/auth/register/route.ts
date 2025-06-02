import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const db = await connectDB()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const result = await db.collection("users").insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: {
        notifications: true,
        voiceEnabled: true,
        theme: "system",
        aiProvider: "auto",
      },
    })

    const token = jwt.sign(
      {
        userId: result.insertedId,
        email: email.toLowerCase(),
      },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    console.log(`✅ New user registered: ${email}`)

    return NextResponse.json({
      token,
      user: {
        id: result.insertedId,
        email: email.toLowerCase(),
        name: name.trim(),
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
