import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"
import { connectDB } from "@/lib/mongodb"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // Check if Twilio is configured
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
      console.warn("Twilio not configured, using mock OTP")

      // For development: use a fixed OTP
      const otp = env.NODE_ENV === "development" ? "123456" : Math.floor(100000 + Math.random() * 900000).toString()

      const db = await connectDB()
      await db.collection("otps").insertOne({
        phone,
        otp,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      })

      console.log(`Mock OTP for ${phone}: ${otp}`)
      return NextResponse.json({ success: true, mockOtp: env.NODE_ENV === "development" ? otp : undefined })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP in database with expiration
    const db = await connectDB()
    await db.collection("otps").insertOne({
      phone,
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    // Send SMS
    const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
    await client.messages.create({
      body: `Your MindMate verification code is: ${otp}`,
      from: env.TWILIO_PHONE_NUMBER,
      to: phone,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}
