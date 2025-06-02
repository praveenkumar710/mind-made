import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"
import { connectDB } from "@/lib/mongodb"
import { env } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        {
          error: "Invalid phone number format. Please use international format (+1234567890)",
        },
        { status: 400 },
      )
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

    // Check if Twilio is configured
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
      console.warn("⚠️ Twilio not configured, using development mode")

      // In development, return the OTP for testing
      if (env.NODE_ENV === "development") {
        console.log(`📱 Development OTP for ${phone}: ${otp}`)
        return NextResponse.json({
          success: true,
          message: "OTP sent successfully",
          developmentOtp: otp, // Only in development
        })
      } else {
        return NextResponse.json(
          {
            error: "SMS service not configured",
          },
          { status: 500 },
        )
      }
    }

    try {
      // Send SMS using Twilio
      const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
      await client.messages.create({
        body: `Your MindMate verification code is: ${otp}. This code expires in 10 minutes.`,
        from: env.TWILIO_PHONE_NUMBER,
        to: phone,
      })

      console.log(`📱 OTP sent to ${phone}`)
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
      })
    } catch (twilioError) {
      console.error("Twilio error:", twilioError)
      return NextResponse.json(
        {
          error: "Failed to send SMS. Please try again.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
