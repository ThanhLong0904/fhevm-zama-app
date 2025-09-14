// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE-based Private Voting Room
/// @author fhevm-zama-app
/// @notice A voting contract that ensures privacy using Fully Homomorphic Encryption
contract VotingRoom is SepoliaConfig {
    struct Candidate {
        string name;
        string description;
        string imageUrl;
        euint32 votes; // Encrypted vote count
        bool exists;
    }

    struct Room {
        string code;
        string title;
        string description;
        address creator;
        uint256 maxParticipants;
        uint256 participantCount;
        uint256 endTime;
        bool hasPassword;
        bytes32 passwordHash; // Hash of password if required
        bool isActive;
        uint256 candidateCount;
    }

    // Room management
    mapping(string => Room) public rooms;
    mapping(string => mapping(uint256 => Candidate)) public roomCandidates;
    mapping(string => mapping(address => bool)) public hasVoted;
    mapping(string => mapping(address => bool)) public isParticipant;
    
    // Events
    event RoomCreated(string indexed roomCode, address indexed creator, string title);
    event VoteCast(string indexed roomCode, address indexed voter);
    event RoomJoined(string indexed roomCode, address indexed participant);
    event RoomEnded(string indexed roomCode);

    modifier roomExists(string memory roomCode) {
        require(bytes(rooms[roomCode].code).length > 0, "Room does not exist");
        _;
    }

    modifier roomActive(string memory roomCode) {
        require(rooms[roomCode].isActive, "Room is not active");
        require(rooms[roomCode].endTime > block.timestamp, "Room has ended");
        _;
    }

    modifier hasNotVoted(string memory roomCode) {
        require(!hasVoted[roomCode][msg.sender], "Already voted in this room");
        _;
    }

    modifier isRoomParticipant(string memory roomCode) {
        require(isParticipant[roomCode][msg.sender], "Not a participant in this room");
        _;
    }

    /// @notice Creates a new voting room
    /// @param roomCode Unique room identifier
    /// @param title Room title
    /// @param description Room description
    /// @param maxParticipants Maximum number of participants
    /// @param endTime Unix timestamp when voting ends
    /// @param hasPassword Whether the room requires a password
    /// @param passwordHash Hash of the password (if required)
    function createRoom(
        string memory roomCode,
        string memory title,
        string memory description,
        uint256 maxParticipants,
        uint256 endTime,
        bool hasPassword,
        bytes32 passwordHash
    ) external {
        require(bytes(rooms[roomCode].code).length == 0, "Room code already exists");
        require(endTime > block.timestamp, "End time must be in the future");
        require(maxParticipants > 0, "Max participants must be greater than 0");

        rooms[roomCode] = Room({
            code: roomCode,
            title: title,
            description: description,
            creator: msg.sender,
            maxParticipants: maxParticipants,
            participantCount: 0,
            endTime: endTime,
            hasPassword: hasPassword,
            passwordHash: passwordHash,
            isActive: true,
            candidateCount: 0
        });

        // Creator automatically becomes a participant
        isParticipant[roomCode][msg.sender] = true;
        rooms[roomCode].participantCount = 1;

        emit RoomCreated(roomCode, msg.sender, title);
    }

    /// @notice Adds a candidate to a room
    /// @param roomCode Room identifier
    /// @param name Candidate name
    /// @param description Candidate description
    /// @param imageUrl Candidate image URL
    function addCandidate(
        string memory roomCode,
        string memory name,
        string memory description,
        string memory imageUrl
    ) external roomExists(roomCode) {
        require(msg.sender == rooms[roomCode].creator, "Only creator can add candidates");
        require(rooms[roomCode].isActive, "Room is not active");

        uint256 candidateId = rooms[roomCode].candidateCount;
        
        // Initialize encrypted zero with proper permissions
        euint32 initialVotes = FHE.asEuint32(0);
        FHE.allowThis(initialVotes);
        FHE.allow(initialVotes, msg.sender); // Allow creator to decrypt
        
        roomCandidates[roomCode][candidateId] = Candidate({
            name: name,
            description: description,
            imageUrl: imageUrl,
            votes: initialVotes,
            exists: true
        });

        rooms[roomCode].candidateCount++;
    }

    /// @notice Joins a room (with optional password)
    /// @param roomCode Room identifier
    /// @param password Plain text password (if required)
    function joinRoom(string memory roomCode, string memory password) 
        external 
        roomExists(roomCode) 
        roomActive(roomCode) 
    {
        require(!isParticipant[roomCode][msg.sender], "Already a participant");
        require(rooms[roomCode].participantCount < rooms[roomCode].maxParticipants, "Room is full");

        // Check password if required
        if (rooms[roomCode].hasPassword) {
            bytes32 providedHash = keccak256(abi.encodePacked(password));
            require(providedHash == rooms[roomCode].passwordHash, "Invalid password");
        }

        isParticipant[roomCode][msg.sender] = true;
        rooms[roomCode].participantCount++;

        emit RoomJoined(roomCode, msg.sender);
    }

    /// @notice Casts an encrypted vote for a candidate
    /// @param roomCode Room identifier
    /// @param candidateId Candidate index
    /// @param encryptedVote Encrypted vote (should be 1)
    /// @param inputProof Input proof for the encrypted vote
    function vote(
        string memory roomCode,
        uint256 candidateId,
        externalEuint32 encryptedVote,
        bytes calldata inputProof
    ) external 
        roomExists(roomCode) 
        roomActive(roomCode) 
        isRoomParticipant(roomCode) 
        hasNotVoted(roomCode) 
    {
        require(candidateId < rooms[roomCode].candidateCount, "Invalid candidate");
        require(roomCandidates[roomCode][candidateId].exists, "Candidate does not exist");

        // Convert external encrypted input to internal
        euint32 encryptedVoteValue = FHE.fromExternal(encryptedVote, inputProof);
        
        // Add the vote to the candidate's vote count
        roomCandidates[roomCode][candidateId].votes = FHE.add(
            roomCandidates[roomCode][candidateId].votes, 
            encryptedVoteValue
        );

        // Allow the contract, voter, and creator to access the updated vote count
        FHE.allowThis(roomCandidates[roomCode][candidateId].votes);
        FHE.allow(roomCandidates[roomCode][candidateId].votes, msg.sender);
        FHE.allow(roomCandidates[roomCode][candidateId].votes, rooms[roomCode].creator);

        // Mark as voted
        hasVoted[roomCode][msg.sender] = true;

        emit VoteCast(roomCode, msg.sender);
    }

    /// @notice Gets encrypted vote count for a candidate
    /// @param roomCode Room identifier
    /// @param candidateId Candidate index
    /// @return Encrypted vote count
    function getCandidateVotes(string memory roomCode, uint256 candidateId) 
        external 
        view 
        roomExists(roomCode) 
        returns (euint32) 
    {
        require(candidateId < rooms[roomCode].candidateCount, "Invalid candidate");
        return roomCandidates[roomCode][candidateId].votes;
    }

    /// @notice Gets room information
    /// @param roomCode Room identifier
    /// @return Room struct
    function getRoom(string memory roomCode) 
        external 
        view 
        roomExists(roomCode) 
        returns (Room memory) 
    {
        return rooms[roomCode];
    }

    /// @notice Gets candidate information
    /// @param roomCode Room identifier
    /// @param candidateId Candidate index
    /// @return name Candidate name
    /// @return description Candidate description
    /// @return imageUrl Candidate image URL
    function getCandidate(string memory roomCode, uint256 candidateId)
        external
        view
        roomExists(roomCode)
        returns (string memory name, string memory description, string memory imageUrl)
    {
        require(candidateId < rooms[roomCode].candidateCount, "Invalid candidate");
        Candidate memory candidate = roomCandidates[roomCode][candidateId];
        return (candidate.name, candidate.description, candidate.imageUrl);
    }

    /// @notice Ends a room (only creator)
    /// @param roomCode Room identifier
    function endRoom(string memory roomCode) external roomExists(roomCode) {
        require(msg.sender == rooms[roomCode].creator, "Only creator can end room");
        require(rooms[roomCode].isActive, "Room already ended");

        rooms[roomCode].isActive = false;
        emit RoomEnded(roomCode);
    }

    /// @notice Checks if a user has voted in a room
    /// @param roomCode Room identifier
    /// @param user User address
    /// @return Whether the user has voted
    function hasUserVoted(string memory roomCode, address user) 
        external 
        view 
        roomExists(roomCode) 
        returns (bool) 
    {
        return hasVoted[roomCode][user];
    }

    /// @notice Checks if a user is a participant in a room
    /// @param roomCode Room identifier
    /// @param user User address
    /// @return Whether the user is a participant
    function isUserParticipant(string memory roomCode, address user) 
        external 
        view 
        roomExists(roomCode) 
        returns (bool) 
    {
        return isParticipant[roomCode][user];
    }
}