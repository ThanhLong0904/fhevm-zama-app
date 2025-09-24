// Create test rooms for testing Featured Rooms section
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Creating test rooms with account:", signer.address);

  // Get deployed VotingRoom contract
  const VotingRoom = await ethers.getContractFactory("VotingRoom");
  // const votingRoom = VotingRoom.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
  const votingRoom = VotingRoom.attach("0xfC4C6F6ABE4998b7ec618AB716Cf631cC6F35B06");

  // Test room data
  const testRooms = [
    {
      code: "MARKET01",
      title: "Marketing Team Leader Election",
      description: "Choose the marketing team leader for Q4 2024",
      candidates: ["Alice Johnson", "Bob Smith", "Carol White"],
      candidateDescriptions: [
        "Experienced marketing strategist with 5+ years",
        "Creative director with proven track record",
        "Digital marketing specialist and analytics expert"
      ],
      imageUrls: ["", "", ""]
    },
    {
      code: "IDEA2024",
      title: "Creative Ideas Contest",
      description: "Vote for the best new product idea",
      candidates: ["Smart Home Hub", "AI Assistant", "Eco-Friendly App"],
      candidateDescriptions: [
        "Central control for all smart home devices",
        "Personal AI assistant for productivity",
        "App to track and reduce carbon footprint"
      ],
      imageUrls: ["", "", ""]
    },
    {
      code: "TRAVEL24",
      title: "Team Building Location",
      description: "Decide the destination for team building trip",
      candidates: ["Beach Resort", "Mountain Cabin", "City Adventure"],
      candidateDescriptions: [
        "Relaxing beach resort with team activities",
        "Cozy mountain cabin for bonding",
        "Exciting city exploration and experiences"
      ],
      imageUrls: ["", "", ""]
    }
  ];

  for (const room of testRooms) {
    try {
      // Create room with 1-hour duration for testing
      const endTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      console.log(`Creating room: ${room.title} (${room.code})`);

      const tx = await votingRoom.createRoomWithCandidatesBatch(
        room.code,
        room.title,
        room.description,
        20, // maxParticipants
        endTime,
        false, // hasPassword
        ethers.ZeroHash, // passwordHash (empty for no password)
        room.candidates,
        room.candidateDescriptions,
        room.imageUrls
      );

      await tx.wait();
      console.log(`✓ Created room ${room.code} successfully`);

    } catch (error) {
      console.error(`Error creating room ${room.code}:`, error.message);
    }
  }

  console.log("Test room creation completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });