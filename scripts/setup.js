const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

console.log("🚀 Setting up MindMate...\n")

// Create .env.local if it doesn't exist
const envPath = path.join(process.cwd(), ".env.local")

if (!fs.existsSync(envPath)) {
  const jwtSecret = crypto.randomBytes(64).toString("hex")
  const nextAuthSecret = crypto.randomBytes(32).toString("hex")

  const envContent = `# Database
MONGODB_URI=mongodb://localhost:27017/mindmate

# Authentication
JWT_SECRET=${jwtSecret}
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000

# OpenAI API (Optional - for AI chat)
OPENAI_API_KEY=your-openai-api-key-here

# XAI/Grok API (Optional - alternative to OpenAI)
XAI_API_KEY=your-xai-api-key-here

# Twilio (Optional - for SMS OTP)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# App Configuration
NODE_ENV=development
`

  fs.writeFileSync(envPath, envContent)
  console.log("✅ Created .env.local file with secure secrets")
} else {
  console.log("ℹ️  .env.local already exists")
}

console.log("\n📋 Next steps:")
console.log("1. Update .env.local with your API keys")
console.log("2. Set up MongoDB (local or Atlas)")
console.log("3. Run: npm run dev")
console.log("\n🔧 Optional configurations:")
console.log("- Add OpenAI API key for AI chat")
console.log("- Add Twilio credentials for SMS OTP")
console.log("- Add XAI API key for Grok integration")
console.log("\n🚀 Ready to start developing!")
