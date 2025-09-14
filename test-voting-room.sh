#!/bin/bash

# Test VotingRoom Contract
# This script will create a room and add candidates using the real contract

echo "Testing VotingRoom Contract Integration..."

# Navigate to hardhat directory
cd "s:\zama\fhevm-zama-app\fhevm-hardhat"

echo "1. Creating room TEST123..."
npx hardhat task:voting-create-room --room-code "TEST123" --title "Test Room" --description "Test room for debugging" --max-participants 100 --end-hours 24 --network localhost

echo "2. Adding candidate Song..."
npx hardhat task:voting-add-candidate --room-code "TEST123" --name "Song" --description "Candidate Song" --image-url "https://example.com/song.jpg" --network localhost

echo "3. Adding candidate Long..."
npx hardhat task:voting-add-candidate --room-code "TEST123" --name "Long" --description "Candidate Long" --image-url "https://example.com/long.jpg" --network localhost

echo "4. Getting room info..."
npx hardhat task:voting-get-room --room-code "TEST123" --network localhost

echo "5. Getting candidates..."
npx hardhat task:voting-get-candidates --room-code "TEST123" --network localhost

echo "Test completed!"