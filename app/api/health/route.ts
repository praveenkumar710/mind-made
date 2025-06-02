import { NextResponse } from "next/server"
import { checkDBHealth } from "@/lib/mongodb"
import { env } from "@/lib/env"

export async function GET() {
  try {
    const dbHealthy = await checkDBHealth()

    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? "healthy" : "unhealthy",
        openai: env.OPENAI_API_KEY ? "configured" : "not configured",
        grok: env.XAI_API_KEY ? "configured" : "not configured",
        twilio: env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN ? "configured" : "not configured",
      },
      environment: env.NODE_ENV,
    }

    return NextResponse.json(health, {
      status: dbHealthy ? 200 : 503,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
