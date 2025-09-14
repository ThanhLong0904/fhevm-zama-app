# FHE Voting Platform - Hướng dẫn chạy Project

## Tổng quan hệ thống

Dự án này là một nền tảng voting sử dụng Fully Homomorphic Encryption (FHE) để đảm bảo tính riêng tư trong quá trình bỏ phiếu. 

### Cấu trúc dự án:
- **fhevm-hardhat/**: Smart contracts (Solidity) và Hardhat tasks
- **Frontend/**: Next.js frontend application
- **ZamaTheme/**: UI components và styling

## Yêu cầu hệ thống

### Phần mềm cần thiết:
1. **Node.js** v18+ 
2. **Git Bash** (cho Windows) hoặc terminal (Linux/Mac)
3. **MetaMask** browser extension

### Kiến thức cần có:
- Cơ bản về blockchain và smart contracts
- React/Next.js
- Command line basics

## Bước 1: Cài đặt Dependencies

### 1.1 Clone repository và cài đặt Backend dependencies:

```bash
# Di chuyển vào thư mục backend
cd fhevm-hardhat

# Cài đặt dependencies
npm install

# Hoặc nếu gặp lỗi, thử với:
npm install --legacy-peer-deps
```

### 1.2 Cài đặt Frontend dependencies:

```bash
# Di chuyển vào thư mục frontend
cd ../Frontend

# Cài đặt dependencies
npm install

# Hoặc nếu gặp lỗi:
npm install --legacy-peer-deps
```

## Bước 2: Cấu hình môi trường

### 2.1 Cấu hình Hardhat Network:

```bash
# Trong thư mục fhevm-hardhat
# Tạo file .env (nếu chưa có)
echo "PRIVATE_KEY=your_private_key_here" > .env
```

> **Lưu ý**: Thay `your_private_key_here` bằng private key thật nếu deploy lên testnet. Với localhost thì không cần.

### 2.2 Cấu hình MetaMask:

1. Cài đặt MetaMask extension
2. Thêm Hardhat localhost network:
   - Network Name: `Hardhat Localhost`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

## Bước 3: Chạy Backend (Blockchain node)

### 3.1 Khởi động Hardhat node:

```bash
# Trong thư mục fhevm-hardhat
npx hardhat node
```

**Kết quả mong đợi**: 
- Thấy 20 accounts với balance 10000 ETH
- Node chạy trên `http://127.0.0.1:8545/`

### 3.2 Deploy Smart Contracts (Terminal mới):

```bash
# Mở terminal mới, vào thư mục fhevm-hardhat
cd fhevm-hardhat

# Deploy contracts
npx hardhat --network localhost deploy
```

**Kết quả mong đợi**:
```
FHECounter contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
VotingRoom contract: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 3.3 Kiểm tra deployment:

```bash
# Kiểm tra FHECounter
npx hardhat --network localhost task:address

# Kiểm tra VotingRoom
npx hardhat --network localhost task:voting-address
```

## Bước 4: Generate ABI files cho Frontend

```bash
# Trong thư mục Frontend
cd ../Frontend

# Generate ABI files từ deployed contracts
npm run genabi

# Hoặc sử dụng script mới (hỗ trợ multiple contracts):
node scripts/genabi-multi.mjs
```

**Kết quả mong đợi**:
```
Generated Frontend/abi/FHECounterABI.ts
Generated Frontend/abi/FHECounterAddresses.ts
Generated Frontend/abi/VotingRoomABI.ts
Generated Frontend/abi/VotingRoomAddresses.ts
```

## Bước 5: Chạy Frontend

```bash
# Trong thư mục Frontend
npm run dev
```

**Kết quả mong đợi**:
- Frontend chạy trên `http://localhost:3000`
- Có thể truy cập được website

## Bước 6: Kiểm tra kết nối End-to-End

### 6.1 Import account vào MetaMask:

```bash
# Lấy private key từ hardhat node (account #0)
# Copy private key hiển thị khi chạy `npx hardhat node`
# Import vào MetaMask
```

### 6.2 Test tạo voting room:

```bash
# Trong terminal backend
npx hardhat --network localhost task:voting-create-room \
  --code "DEMO001" \
  --title "Test Election" \
  --description "Testing the voting system" \
  --maxparticipants 10 \
  --endhours 24
```

### 6.3 Thêm candidates:

```bash
npx hardhat --network localhost task:voting-add-candidate \
  --code "DEMO001" \
  --name "Alice Johnson" \
  --description "Experienced leader" \
  --imageurl "https://example.com/alice.jpg"

npx hardhat --network localhost task:voting-add-candidate \
  --code "DEMO001" \
  --name "Bob Smith" \
  --description "Innovative thinker" \
  --imageurl "https://example.com/bob.jpg"
```

### 6.4 Kiểm tra room:

```bash
npx hardhat --network localhost task:voting-get-room --code "DEMO001"
```

### 6.5 Test voting:

```bash
# Join room (nếu cần)
npx hardhat --network localhost task:voting-join-room --code "DEMO001"

# Cast vote cho candidate 0
npx hardhat --network localhost task:voting-vote \
  --code "DEMO001" \
  --candidate 0 \
  --vote 1
```

## Bước 7: Test trên Frontend

1. Mở `http://localhost:3000`
2. Connect MetaMask
3. Thử tạo room mới
4. Thử join room với code `DEMO001`
5. Thử vote cho candidate

## Troubleshooting

### Lỗi thường gặp:

#### 1. "Could not detect network"
```bash
# Restart hardhat node
npx hardhat node
```

#### 2. "Contract not deployed"
```bash
# Re-deploy contracts
npx hardhat --network localhost deploy --reset
```

#### 3. "Transaction failed"
```bash
# Reset MetaMask account (Advanced settings > Reset Account)
```

#### 4. "ABI files not found"
```bash
# Re-generate ABI
cd Frontend
npm run genabi
```

#### 5. Frontend connection issues
```bash
# Check if correct network in MetaMask
# Network: Hardhat Localhost
# RPC: http://localhost:8545
# Chain ID: 31337
```

## API Mapping Summary

### Đã implement:

| Frontend Action | Backend Endpoint | Status |
|---|---|---|
| Create Room | `task:voting-create-room` | ✅ Complete |
| Add Candidate | `task:voting-add-candidate` | ✅ Complete |
| Join Room | `task:voting-join-room` | ✅ Complete |
| Cast Vote | `task:voting-vote` | ✅ Complete |
| Get Room Info | `task:voting-get-room` | ✅ Complete |
| Check Vote Status | `task:voting-has-voted` | ✅ Complete |
| Decrypt Results | `task:voting-decrypt-votes` | ✅ Complete |

### Frontend Components:

| Component | API Integration | Status |
|---|---|---|
| CreateRoomPage | useVotingRoom hook | ✅ Complete |
| RoomVotingPage | useVotingRoom hook | ✅ Complete |
| DashboardPage | Mock data | ⚠️ Needs real API |
| FHECounterDemo | useFHECounter hook | ✅ Complete |

## Development Commands

### Backend (fhevm-hardhat):
```bash
# Start local blockchain
npx hardhat node

# Deploy contracts
npx hardhat --network localhost deploy

# Create voting room
npx hardhat --network localhost task:voting-create-room --code "ROOM001" --title "Test" --description "Testing" --maxparticipants 10 --endhours 24

# Add candidate
npx hardhat --network localhost task:voting-add-candidate --code "ROOM001" --name "Candidate 1" --description "Description" --imageurl "https://example.com/image.jpg"

# Vote
npx hardhat --network localhost task:voting-vote --code "ROOM001" --candidate 0 --vote 1

# Get room info
npx hardhat --network localhost task:voting-get-room --code "ROOM001"

# Decrypt votes (for creator only)
npx hardhat --network localhost task:voting-decrypt-votes --code "ROOM001" --candidate 0
```

### Frontend:
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Generate ABI files
npm run genabi

# Run linting
npm run lint
```

## Production Deployment

### Deploy to Sepolia Testnet:

1. **Cấu hình environment**:
```bash
# Trong fhevm-hardhat/.env
PRIVATE_KEY=your_real_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
```

2. **Deploy contracts**:
```bash
npx hardhat --network sepolia deploy
```

3. **Update frontend config**:
```bash
# Re-generate ABI với Sepolia addresses
cd ../Frontend
npm run genabi
```

4. **Deploy frontend**:
```bash
npm run build
# Deploy to Vercel, Netlify, etc.
```

## Kết luận

Sau khi hoàn thành các bước trên, bạn sẽ có:

1. ✅ **Blockchain backend** chạy với VotingRoom smart contract
2. ✅ **Frontend** kết nối với smart contract qua Web3
3. ✅ **End-to-end voting flow** với FHE encryption
4. ✅ **Complete API mapping** giữa FE và BE

Project hiện đã sẵn sàng cho development và testing!

## Support

Nếu gặp vấn đề, kiểm tra:
1. Hardhat node có đang chạy không
2. MetaMask có connect đúng network không
3. Smart contracts đã deploy thành công chưa
4. ABI files đã được generate chưa