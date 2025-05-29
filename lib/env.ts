// Environment configuration with validation
export const env = {
  // Database
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/mindmate",

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || "fallback-jwt-secret-change-in-production",

  // AI APIs
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  XAI_API_KEY: process.env.XAI_API_KEY || "",

  // Twilio
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "",

  // App
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
}

// Validation function
export function validateEnv() {
  const required = ["MONGODB_URI", "JWT_SECRET"]

  const missing = required.filter((key) => !env[key as keyof typeof env])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}

// Optional validation for production features
export function validateProductionEnv() {
  const productionRequired = ["OPENAI_API_KEY", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"]

  const missing = productionRequired.filter((key) => !env[key as keyof typeof env])

  if (missing.length > 0) {
    console.warn(`Missing optional environment variables: ${missing.join(", ")}`)
    console.warn("Some features may not work properly.")
  }
}
