#!/usr/bin/env node

// Test script để debug voting issue
const { ethers } = require("ethers");

async function testVotingConnection() {
  console.log("=== Testing Voting Connection ===");

  try {
    // 1. Test provider connection
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const blockNumber = await provider.getBlockNumber();
    console.log("✅ Provider connected, block number:", blockNumber);

    // 2. Test contract address
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("❌ No contract at address:", contractAddress);
    } else {
      console.log("✅ Contract found at:", contractAddress);
    }

    // 3. Test signer availability (will use first hardhat account)
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // First hardhat account
    const signer = new ethers.Wallet(privateKey, provider);
    console.log("✅ Signer address:", signer.address);

    // 4. Test basic contract call (getRoom)
    const abi = [
      "function getRoom(string memory roomCode) view returns (tuple(string code, string title, string description, address creator, uint256 maxParticipants, uint256 participantCount, uint256 endTime, bool hasPassword, bytes32 passwordHash, bool isActive, uint256 candidateCount))"
    ];

    const contract = new ethers.Contract(contractAddress, abi, provider);
    const roomInfo = await contract.getRoom("TEST123");
    console.log("✅ Room info:", {
      code: roomInfo.code,
      title: roomInfo.title,
      candidateCount: roomInfo.candidateCount.toString()
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testVotingConnection();