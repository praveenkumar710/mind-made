import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Registration attempt started")

    const body = await request.json()
    console.log("📝 Registration data received:", { email: body.email, name: body.name })

    const { email, password, name } = body

    // Validation
    if (!email || !password || !name) {
      console.log("❌ Missing required fields")
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("❌ Password too short")
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format")
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    console.log("🔄 Connecting to database...")
    const db = await connectDB()
    console.log("✅ Database connected")

    // Check if user already exists
    console.log("🔍 Checking if user exists...")
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() })
    if (existingUser) {
      console.log("❌ User already exists")
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 })
    }

    console.log("🔄 Hashing password...")
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("✅ Password hashed")

    console.log("🔄 Creating user...")
    // Create user
    const userDoc = {
      email: email.toLowerCase().trim(),
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
    }

    const result = await db.collection("users").insertOne(userDoc)
    console.log("✅ User created with ID:", result.insertedId)

    console.log("🔄 Generating JWT token...")
    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        email: email.toLowerCase(),
      },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    )
    console.log("✅ JWT token generated")

    const responseData = {
      token,
      user: {
        id: result.insertedId.toString(),
        email: email.toLowerCase(),
        name: name.trim(),
      },
    }

    console.log("✅ Registration successful for:", email)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json(
      {
        error: "Registration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
