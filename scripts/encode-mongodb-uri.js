// Utility script to properly encode MongoDB URI
// Run with: node scripts/encode-mongodb-uri.js

const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log("MongoDB URI Encoder Utility")
console.log("===========================")
console.log("This tool helps encode special characters in your MongoDB URI")
console.log("")

rl.question("Enter your MongoDB username: ", (username) => {
  rl.question("Enter your MongoDB password: ", (password) => {
    rl.question("Enter your MongoDB host (e.g., cluster0.abc123.mongodb.net): ", (host) => {
      rl.question("Enter your database name: ", (dbName) => {
        // Encode username and password
        const encodedUsername = encodeURIComponent(username)
        const encodedPassword = encodeURIComponent(password)

        // Construct the URI
        const uri = `mongodb+srv://${encodedUsername}:${encodedPassword}@${host}/${dbName}?retryWrites=true&w=majority`

        console.log("\nEncoded MongoDB URI:")
        console.log(uri)
        console.log("\nAdd this to your .env.local file as MONGODB_URI")

        rl.close()
      })
    })
  })
})
