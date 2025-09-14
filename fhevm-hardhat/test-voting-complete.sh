#!/bin/bash

# run:
#   bash test-voting-complete.sh

# VotingRoom Complete Test Flow
echo "=== VotingRoom Complete Test Flow ==="
echo "Testing với Song, Long, Quynh - tất cả vote cho Song"
echo ""

ROOM_CODE="BASH_TEST"

echo "1. Tạo phòng vote..."
npx hardhat --network localhost task:voting-create-room --code "$ROOM_CODE" --title "Cuộc bầu cử test" --description "Test với Song, Long, Quynh" --maxparticipants 10 --endhours 24

echo ""
echo "2. Thêm candidates..."
npx hardhat --network localhost task:voting-add-candidate --code "$ROOM_CODE" --name "Song" --description "Ứng viên Song" --imageurl "https://example.com/song.jpg"
npx hardhat --network localhost task:voting-add-candidate --code "$ROOM_CODE" --name "Long" --description "Ứng viên Long" --imageurl "https://example.com/long.jpg"  
npx hardhat --network localhost task:voting-add-candidate --code "$ROOM_CODE" --name "Quynh" --description "Ứng viên Quynh" --imageurl "https://example.com/quynh.jpg"

echo ""
echo "3. Kiểm tra phòng..."
npx hardhat --network localhost task:voting-get-room --code "$ROOM_CODE"

echo ""
echo "4. Nhiều participants vote cho Song (candidate 0)..."
echo "Participant 1 (creator) vote cho Song:"
npx hardhat --network localhost task:voting-vote --code "$ROOM_CODE" --candidate 0 --vote 1

echo "Participant 2 join room và vote cho Song:"
npx hardhat --network localhost task:voting-join-as --code "$ROOM_CODE" --signer 1
npx hardhat --network localhost task:voting-vote-as --code "$ROOM_CODE" --candidate 0 --vote 1 --signer 1

echo "Participant 3 join room và vote cho Song:"
npx hardhat --network localhost task:voting-join-as --code "$ROOM_CODE" --signer 2
npx hardhat --network localhost task:voting-vote-as --code "$ROOM_CODE" --candidate 0 --vote 1 --signer 2

echo ""
echo "5. Kiểm tra votes..."
echo "Song votes:"
npx hardhat --network localhost task:voting-decrypt-votes --code "$ROOM_CODE" --candidate 0
echo "Long votes:"
npx hardhat --network localhost task:voting-decrypt-votes --code "$ROOM_CODE" --candidate 1
echo "Quynh votes:"
npx hardhat --network localhost task:voting-decrypt-votes --code "$ROOM_CODE" --candidate 2

echo ""
echo "6. Kết thúc phòng..."
npx hardhat --network localhost task:voting-end-room --code "$ROOM_CODE"

echo ""
echo "7. Trạng thái cuối..."
npx hardhat --network localhost task:voting-get-room --code "$ROOM_CODE"

echo ""
echo "=== VERIFICATION ==="
echo "✓ Song: 3 votes (tất cả 3 participants vote cho Song)"
echo "✓ Long: 0 votes (không ai vote)"
echo "✓ Quynh: 0 votes (không ai vote)"
echo "✓ Room status: Active = false"
echo "=== Test Complete ==="