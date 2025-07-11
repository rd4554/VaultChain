require("dotenv").config({ path: ".env.local" });

console.log("API_URL =", process.env.API_URL);
console.log("PRIVATE_KEY =", process.env.PRIVATE_KEY);

require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
   sepolia: {
    url: process.env.API_URL,
    accounts: [process.env.PRIVATE_KEY],
   },
  },
};
