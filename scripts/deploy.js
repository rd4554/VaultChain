const hre = require("hardhat");

async function main() {
  const ContractFactory = await hre.ethers.getContractFactory("FileStorage"); 

  const contract = await ContractFactory.deploy();

  await contract.waitForDeployment(); 

  console.log("✅ Contract deployed at:", contract.target); 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
