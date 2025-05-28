import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()

    const db = await connectDB()

    // Verify OTP
    const otpRecord = await db.collection("otps").findOne({
      phone,
      otp,
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 })
    }

    // Find or create user
    let user = await db.collection("users").findOne({ phone })

    if (!user) {
      // Create new user with phone
      const result = await db.collection("users").insertOne({
        phone,
        name: `User ${phone.slice(-4)}`,
        createdAt: new Date(),
        preferences: {
          notifications: true,
          voiceEnabled: true,
          theme: "system",
        },
      })
      user = { _id: result.insertedId, phone, name: `User ${phone.slice(-4)}` }
    }

    // Delete used OTP
    await db.collection("otps").deleteOne({ _id: otpRecord._id })

    const token = jwt.sign({ userId: user._id, phone: user.phone }, process.env.JWT_SECRET!, { expiresIn: "7d" })

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
