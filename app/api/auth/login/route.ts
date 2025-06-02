import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Login attempt started")

    const body = await request.json()
    console.log("📝 Login data received:", { email: body.email })

    const { email, password } = body

    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("🔄 Connecting to database...")
    const db = await connectDB()
    console.log("✅ Database connected")

    console.log("🔍 Looking for user:", email.toLowerCase())
    const user = await db.collection("users").findOne({ email: email.toLowerCase() })

    if (!user) {
      console.log("❌ User not found")
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log("✅ User found, checking password...")
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log("❌ Invalid password")
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log("🔄 Generating JWT token...")
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    )
    console.log("✅ JWT token generated")

    const responseData = {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    }

    console.log("✅ Login successful for:", user.email)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json(
      {
        error: "Login failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
