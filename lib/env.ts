// Environment configuration with validation
export const env = {
  // Database
  // Switch to local MongoDB instance
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb+srv://praveenkumarpp710:TP710leomd@cluster0.hfwn5c5.mongodb.net/mindmate?retryWrites=true&w=majority",
    // "mongodb://localhost:27017/mindmate",

  // Authentication
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "1fc734caca76c9868e1866777e2bc5775782267895550687ff9f2e2818c8a555e6f72dd3e97d59605ae38c00c2b7b037a30ac3bd23f245b167626e73f815ae8f",

  // AI APIs
  OPENAI_API_KEY:
    process.env.OPENAI_API_KEY ||
    "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",
  XAI_API_KEY:
    process.env.XAI_API_KEY || "xai-PNbqw5TuNGW90WCYWh4GfbZrOmbhGanoBfIVBqyqLSv1QEgYfEBHIWTlE31VzCBRD3kOYjc0DSaUByWh",

  // Twilio
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "AC05b1cd3289330a49f323d3fa797a57ad",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "5f8b075413c5b90617f7f7d647778560",
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "+17752777496",

  // App Configuration
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXTAUTH_URL:
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
}

// Validation function for required variables
export function validateEnv() {
  const required = ["MONGODB_URI", "JWT_SECRET"]
  const missing = required.filter((key) => !env[key as keyof typeof env])

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(", ")}`)
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }

  console.log("✅ All required environment variables are configured")
}

// Validation for optional features
export function validateOptionalEnv() {
  const features = {
    "AI Chat (OpenAI)": env.OPENAI_API_KEY,
    "AI Chat (Grok)": env.XAI_API_KEY,
    "SMS Authentication": env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER,
  }

  console.log("🔧 Feature availability:")
  Object.entries(features).forEach(([feature, available]) => {
    console.log(`  ${available ? "✅" : "❌"} ${feature}`)
  })
}

// Initialize environment validation
if (typeof window === "undefined") {
  try {
    validateEnv()
    validateOptionalEnv()
  } catch (error) {
    console.error("Environment validation failed:", error)
  }
}
