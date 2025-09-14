#!/bin/bash

echo "🧪 Testing VotingRoom castVote functionality..."

# Step 1: Make sure user joins room first
echo "1️⃣ Joining room TEST123..."
cd "s:/zama/fhevm-zama-app/fhevm-hardhat"
npx hardhat task:voting-join-room --code "TEST123" --password "" --network localhost

echo "2️⃣ Attempting to cast vote for candidate 0..."
npx hardhat task:voting-vote --code "TEST123" --candidate 0 --vote 1 --network localhost

echo "3️⃣ Getting room status after vote..."
npx hardhat task:voting-get-room --code "TEST123" --network localhost

echo "✅ Backend vote test completed!"