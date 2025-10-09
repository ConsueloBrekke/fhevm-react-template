const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Privacy Compliance Auditor contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy the contract
  const PrivacyComplianceAuditor = await ethers.getContractFactory("PrivacyComplianceAuditor");
  const contract = await PrivacyComplianceAuditor.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("PrivacyComplianceAuditor deployed to:", contractAddress);

  // Verify the contract deployment
  console.log("Contract owner:", await contract.owner());
  console.log("Contract regulator:", await contract.regulator());
  console.log("Initial audit count:", await contract.getCurrentAuditCount());

  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("Gas Used: Check transaction receipt");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: network.name,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });