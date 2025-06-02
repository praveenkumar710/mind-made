import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { env } from "@/lib/env"

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Auth verification started")

    const authHeader = request.headers.get("authorization")
    console.log("📝 Auth header:", authHeader ? "Present" : "Missing")

    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      console.log("❌ No token provided")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    console.log("🔄 Verifying JWT token...")
    let decoded
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as any
      console.log("✅ JWT token verified for user:", decoded.userId)
    } catch (jwtError) {
      console.log("❌ Invalid JWT token:", jwtError)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("🔄 Connecting to database...")
    const db = await connectDB()
    console.log("✅ Database connected")

    console.log("🔍 Looking for user with ID:", decoded.userId)
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      console.log("❌ User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const responseData = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
    }

    console.log("✅ User verification successful:", user.email)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("❌ Auth verification error:", error)
    return NextResponse.json(
      {
        error: "Authentication failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 401 },
    )
  }
}
