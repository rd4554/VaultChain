require("dotenv").config({ path: ".env.local" });

console.log("✅ ENV TEST");
console.log("API_URL:", process.env.API_URL);
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
