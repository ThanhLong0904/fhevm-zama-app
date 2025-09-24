"use client";

import { ethers } from "ethers";
import { useState, useCallback, useMemo } from "react";
import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { VotingRoomABI } from "@/abi/VotingRoomABI";

interface Room {
  code: string;
  title: string;
  description: string;
  creator: string;
  maxParticipants: number;
  participantCount: number;
  endTime: number;
  hasPassword: boolean;
  isActive: boolean;
  candidateCount: number;
}

interface Candidate {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  votes?: number;
}

export const useVotingRoom = (parameters: {
  instance: FhevmInstance | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  chainId: number | undefined;
}) => {
  const { instance, ethersSigner, ethersReadonlyProvider } = parameters;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Contract address - should be loaded from deployments
  const votingRoomAddress = useMemo(() => {
    // Updated address from latest deployment
    return "0xfC4C6F6ABE4998b7ec618AB716Cf631cC6F35B06";
  }, []);

  // Contract ABI imported from generated files
  const contractABI = VotingRoomABI;

  // Get contract instance
  const getContract = useCallback(() => {
    if (!ethersSigner || !votingRoomAddress) {
      console.error("Contract initialization failed:", {
        ethersSigner: !!ethersSigner,
        votingRoomAddress,
      });
      return null;
    }
    try {
      return new ethers.Contract(
        votingRoomAddress,
        contractABI.abi,
        ethersSigner
      );
    } catch (error) {
      console.error("Error creating contract instance:", error);
      return null;
    }
  }, [ethersSigner, votingRoomAddress, contractABI]);

  const getReadOnlyContract = useCallback(() => {
    if (!ethersReadonlyProvider || !votingRoomAddress) return null;
    return new ethers.Contract(
      votingRoomAddress,
      contractABI.abi,
      ethersReadonlyProvider
    );
  }, [ethersReadonlyProvider, votingRoomAddress, contractABI]);

  // Create Room
  const createRoom = useCallback(
    async (
      code: string,
      title: string,
      description: string,
      maxParticipants: number,
      endHours: number,
      hasPassword: boolean = false,
      password: string = ""
    ) => {
      const contract = getContract();
      if (!contract) {
        setMessage("Contract or signer not available");
        return false;
      }

      setIsLoading(true);
      setMessage("Creating room...");

      try {
        const endTime = Math.floor(Date.now() / 1000) + endHours * 60 * 60;
        let passwordHash = ethers.ZeroHash;

        if (hasPassword && password) {
          passwordHash = ethers.keccak256(ethers.toUtf8Bytes(password));
        }

        const tx = await contract.createRoom(
          code,
          title,
          description,
          maxParticipants,
          endTime,
          hasPassword,
          passwordHash
        );

        setMessage(`Waiting for transaction ${tx.hash}...`);
        const receipt = await tx.wait();

        if (receipt?.status === 1) {
          setMessage("Room created successfully!");
          return true;
        } else {
          setMessage("Room creation failed");
          return false;
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setMessage(`Error creating room: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [getContract]
  );

  // Create Room with Candidates (optimized method)
  const createRoomWithCandidates = useCallback(
    async (
      code: string,
      title: string,
      description: string,
      maxParticipants: number,
      endHours: number,
      candidates: Array<{ name: string; description: string; image: string }>,
      hasPassword: boolean = false,
      password: string = ""
    ) => {
      const contract = getContract();
      if (!contract) {
        setMessage("Contract or signer not available");
        return false;
      }

      setIsLoading(true);
      setMessage("Creating room with candidates...");

      try {
        const endTime = Math.floor(Date.now() / 1000) + endHours * 60 * 60;
        let passwordHash = ethers.ZeroHash;

        if (hasPassword && password) {
          passwordHash = ethers.keccak256(ethers.toUtf8Bytes(password));
        }

        // First create the room
        const createTx = await contract.createRoom(
          code,
          title,
          description,
          maxParticipants,
          endTime,
          hasPassword,
          passwordHash
        );

        setMessage(`Waiting for room creation ${createTx.hash}...`);
        const createReceipt = await createTx.wait();

        if (createReceipt?.status !== 1) {
          setMessage("Room creation failed");
          return false;
        }

        // Add all candidates in SINGLE BATCH TRANSACTION
        if (candidates.length > 0) {
          setMessage("Adding all candidates in batch...");

          const names = candidates.map((c) => c.name);
          const descriptions = candidates.map((c) => c.description);
          const images = candidates.map((c) => c.image);

          const batchTx = await contract.addCandidatesBatch(
            code,
            names,
            descriptions,
            images
          );
          const batchReceipt = await batchTx.wait();

          if (batchReceipt?.status !== 1) {
            setMessage("Failed to add candidates");
            return false;
          }
        }

        setMessage("Room and candidates created successfully!");
        return true;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setMessage(`Error creating room with candidates: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [getContract]
  );

  // Create Room with Candidates in SINGLE TRANSACTION
  const createRoomWithCandidatesBatchSingle = useCallback(
    async (
      code: string,
      title: string,
      description: string,
      maxParticipants: number,
      endHours: number,
      candidates: Array<{ name: string; description: string; image: string }>,
      hasPassword: boolean = false,
      password: string = ""
    ) => {
      const contract = getContract();
      if (!contract) {
        const errorMsg = !ethersSigner
          ? "MetaMask wallet not connected"
          : !votingRoomAddress
          ? "Contract address not available"
          : "Contract initialization failed";
        setMessage(errorMsg);
        console.error("Contract not available:", {
          ethersSigner: !!ethersSigner,
          votingRoomAddress,
          chainId: parameters.chainId,
        });
        return false;
      }

      setIsLoading(true);
      setMessage("Creating room with candidates in single transaction...");

      try {
        const endTime = Math.floor(Date.now() / 1000) + endHours * 60 * 60;
        let passwordHash = ethers.ZeroHash;

        if (hasPassword && password) {
          passwordHash = ethers.keccak256(ethers.toUtf8Bytes(password));
        }

        // Extract arrays for batch creation
        const names = candidates.map((c) => c.name);
        const descriptions = candidates.map((c) => c.description);
        const images = candidates.map((c) => c.image);

        // Create room and add all candidates in SINGLE TRANSACTION
        const tx = await contract.createRoomWithCandidatesBatch(
          code,
          title,
          description,
          maxParticipants,
          endTime,
          hasPassword,
          passwordHash,
          names,
          descriptions,
          images
        );

        setMessage(`Creating everything in one transaction ${tx.hash}...`);
        const receipt = await tx.wait();

        if (receipt?.status === 1) {
          setMessage(
            "Room and candidates created successfully in one transaction!"
          );
          return true;
        } else {
          setMessage("Room creation failed");
          return false;
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setMessage(`Error creating room: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [getContract, ethersSigner, votingRoomAddress, parameters.chainId]
  );

  // Add Candidate
  const addCandidate = useCallback(
    async (
      roomCode: string,
      name: string,
      description: string,
      imageUrl: string
    ) => {
      const contract = getContract();
      if (!contract) {
        setMessage("Contract not available");
        return false;
      }

      setIsLoading(true);
      setMessage(`Adding candidate ${name}...`);

      try {
        const tx = await contract.addCandidate(
          roomCode,
          name,
          description,
          imageUrl
        );
        setMessage(`Waiting for transaction ${tx.hash}...`);
        const receipt = await tx.wait();

        if (receipt?.status === 1) {
          setMessage("Candidate added successfully!");
          return true;
        } else {
          setMessage("Adding candidate failed");
          return false;
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setMessage(`Error adding candidate: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [getContract]
  );

  // Join Room
  const joinRoom = useCallback(
    async (roomCode: string, password: string = "") => {
      const contract = getContract();
      if (!contract) {
        setMessage("Contract not available");
        throw new Error("Contract not available");
      }

      setIsLoading(true);
      setMessage("Joining room...");

      try {
        const tx = await contract.joinRoom(roomCode, password);
        setMessage(`Waiting for transaction ${tx.hash}...`);
        const receipt = await tx.wait();

        if (receipt?.status === 1) {
          setMessage("Joined room successfully!");
          return true;
        } else {
          setMessage("Joining room failed");
          throw new Error("Transaction failed");
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setMessage(`Error joining room: ${errorMessage}`);

        // Re-throw the error so password validation can catch it
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [getContract]
  );

  // Cast Vote
  const castVote = useCallback(
    async (roomCode: string, candidateId: number) => {
      const contract = getContract();
      if (!contract || !instance || !ethersSigner) {
        setMessage("Contract, FHEVM instance, or signer not available");
        return false;
      }

      setIsLoading(true);
      setMessage("Encrypting vote...");

      try {
        // Debug logging
        console.log("🗳️ Starting vote process:", {
          roomCode,
          candidateId,
          voterAddress: ethersSigner.address,
          contractAddress: votingRoomAddress,
        });

        // Let the browser repaint before running 'input.encrypt()' (CPU-costly)
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Create encrypted input for vote (value = 1) - follow useFHECounter pattern
        console.log("🔐 Creating encrypted input...");
        const input = instance.createEncryptedInput(
          votingRoomAddress,
          ethersSigner.address
        );
        input.add32(1); // Vote value is always 1

        // is CPU-intensive (browser may freeze a little when FHE-WASM modules are loading)
        const enc = await input.encrypt();
        console.log("✅ Encrypted vote created:", {
          handle: enc.handles[0],
          proofLength: enc.inputProof.length,
        });

        setMessage("Casting vote...");
        console.log("📤 Calling contract.vote with params:", {
          roomCode,
          candidateId,
          encryptedVote: enc.handles[0],
          inputProofLength: enc.inputProof.length,
        });

        // Call contract - use enc.handles[0] and enc.inputProof directly like useFHECounter
        const tx: ethers.TransactionResponse = await contract.vote(
          roomCode,
          candidateId,
          enc.handles[0],
          enc.inputProof
        );

        console.log("⏳ Transaction sent:", tx.hash);
        setMessage(`Waiting for transaction ${tx.hash}...`);
        const receipt = await tx.wait();

        console.log(`Vote cast completed status=${receipt?.status}`);

        if (receipt?.status === 1) {
          console.log("✅ Vote cast successfully!");
          setMessage("Vote cast successfully!");
          return true;
        } else {
          console.error("❌ Transaction failed:", receipt);
          setMessage("Transaction failed: Vote could not be cast");
          return false;
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("💥 Vote casting error:", {
          error: errorMessage,
          roomCode,
          candidateId,
          voterAddress: ethersSigner?.address,
        });
        setMessage(`Vote casting failed: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [getContract, instance, ethersSigner, votingRoomAddress]
  );

  // Get Room Info
  const getRoomInfo = useCallback(
    async (roomCode: string): Promise<Room | null> => {
      const contract = getReadOnlyContract();
      if (!contract) {
        setMessage("Contract not available");
        return null;
      }

      try {
        const room = await contract.getRoom(roomCode);
        return {
          code: room.code,
          title: room.title,
          description: room.description,
          creator: room.creator,
          maxParticipants: Number(room.maxParticipants),
          participantCount: Number(room.participantCount),
          endTime: Number(room.endTime),
          hasPassword: room.hasPassword,
          isActive: room.isActive,
          candidateCount: Number(room.candidateCount),
        };
      } catch (error: unknown) {
        setMessage(
          `Error getting room info: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return null;
      }
    },
    [getReadOnlyContract]
  );

  // Get Candidates
  const getCandidates = useCallback(
    async (roomCode: string): Promise<Candidate[]> => {
      const contract = getReadOnlyContract();
      if (!contract) {
        setMessage("Contract not available");
        return [];
      }

      try {
        // First get room info to know how many candidates
        const room = await contract.getRoom(roomCode);
        const candidateCount = Number(room.candidateCount);
        const candidates: Candidate[] = [];

        // Get each candidate
        for (let i = 0; i < candidateCount; i++) {
          const [name, description, imageUrl] = await contract.getCandidate(
            roomCode,
            i
          );
          candidates.push({
            id: i,
            name,
            description,
            imageUrl,
          });
        }

        return candidates;
      } catch (error: unknown) {
        setMessage(
          `Error getting candidates: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return [];
      }
    },
    [getReadOnlyContract]
  );

  // Check if user has voted
  const checkVotingStatus = useCallback(
    async (
      roomCode: string
    ): Promise<{
      hasVoted: boolean;
      isParticipant: boolean;
    }> => {
      const contract = getReadOnlyContract();
      if (!contract || !ethersSigner) {
        return { hasVoted: false, isParticipant: false };
      }

      try {
        const [hasVoted, isParticipant] = await Promise.all([
          contract.hasUserVoted(roomCode, ethersSigner.address),
          contract.isUserParticipant(roomCode, ethersSigner.address),
        ]);

        return { hasVoted, isParticipant };
      } catch (error: unknown) {
        setMessage(
          `Error checking voting status: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return { hasVoted: false, isParticipant: false };
      }
    },
    [getReadOnlyContract, ethersSigner]
  );

  // Get total rooms count
  const getTotalRoomsCount = useCallback(async (): Promise<number> => {
    try {
      const contract = getReadOnlyContract();
      if (!contract) {
        throw new Error("Contract not available");
      }

      const count = await contract.getTotalRoomsCount();
      return Number(count);
    } catch (error) {
      console.error("Error getting total rooms count:", error);
      setMessage("Failed to get total rooms count");
      return 0;
    }
  }, [getReadOnlyContract]);

  // Get all room codes
  const getAllRoomCodes = useCallback(async (): Promise<string[]> => {
    try {
      const contract = getReadOnlyContract();
      if (!contract) {
        throw new Error("Contract not available");
      }

      const roomCodes = await contract.getAllRoomCodes();
      return roomCodes;
    } catch (error) {
      console.error("Error getting all room codes:", error);
      setMessage("Failed to get all room codes");
      return [];
    }
  }, [getReadOnlyContract]);

  // Get active rooms
  const getActiveRooms = useCallback(async (): Promise<string[]> => {
    try {
      const contract = getReadOnlyContract();
      if (!contract) {
        throw new Error("Contract not available");
      }

      const activeRooms = await contract.getActiveRooms();
      return activeRooms;
    } catch (error) {
      console.error("Error getting active rooms:", error);
      setMessage("Failed to get active rooms");
      return [];
    }
  }, [getReadOnlyContract]);

  // Get paginated rooms
  const getRoomsPaginated = useCallback(
    async (
      offset: number = 0,
      limit: number = 10
    ): Promise<{ roomCodes: string[]; hasMore: boolean }> => {
      try {
        const contract = getReadOnlyContract();
        if (!contract) {
          throw new Error("Contract not available");
        }

        const [roomCodes, hasMore] = await contract.getRoomsPaginated(
          offset,
          limit
        );
        return { roomCodes, hasMore };
      } catch (error) {
        console.error("Error getting paginated rooms:", error);
        setMessage("Failed to get paginated rooms");
        return { roomCodes: [], hasMore: false };
      }
    },
    [getReadOnlyContract]
  );

  // Get featured rooms (active rooms with metadata)
  const getFeaturedRooms = useCallback(
    async (limit: number = 6): Promise<Room[]> => {
      try {
        setIsLoading(true);
        const contract = getReadOnlyContract();
        if (!contract) {
          console.warn("Contract not available, returning empty rooms array");
          setMessage("Waiting for blockchain connection...");
          return [];
        }

        // Get active room codes - handle empty result gracefully
        let activeRoomCodes: string[] = [];
        try {
          const result = await contract.getActiveRooms();
          activeRoomCodes = Array.isArray(result) ? result : [];
        } catch (contractError: unknown) {
          const errorMessage =
            contractError instanceof Error
              ? contractError.message
              : "Unknown contract error";
          console.warn(
            "Failed to fetch active rooms from contract:",
            errorMessage
          );
          // If contract call fails, return empty array instead of throwing
          const error = contractError as { code?: string; reason?: string }; // Type assertion for error checking
          if (error?.code === "BAD_DATA" || error?.reason?.includes("decode")) {
            console.info(
              "Contract might not have any rooms yet or contract not properly deployed"
            );
            setMessage("No active rooms found on blockchain");
            return [];
          }
          throw contractError; // Re-throw other unexpected errors
        }

        // If no active rooms, return empty array
        if (!activeRoomCodes || activeRoomCodes.length === 0) {
          setMessage("No active rooms available");
          return [];
        }

        // Limit to specified amount
        const limitedRoomCodes = activeRoomCodes.slice(0, limit);

        // Get full room information for each
        const featuredRooms: Room[] = [];

        for (const roomCode of limitedRoomCodes) {
          try {
            const room = await contract.getRoom(roomCode);
            featuredRooms.push({
              code: room.code,
              title: room.title,
              description: room.description,
              creator: room.creator,
              maxParticipants: Number(room.maxParticipants),
              participantCount: Number(room.participantCount),
              endTime: Number(room.endTime),
              hasPassword: room.hasPassword,
              isActive: room.isActive,
              candidateCount: Number(room.candidateCount),
            });
          } catch (roomError) {
            console.error(`Error getting room ${roomCode}:`, roomError);
            // Continue with other rooms
          }
        }

        return featuredRooms;
      } catch (error) {
        console.error("Error getting featured rooms:", error);
        setMessage("Failed to get featured rooms");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [getReadOnlyContract]
  );

  // Check if user is already a participant in a room (read-only, no transaction)
  const checkParticipantStatus = useCallback(
    async (roomCode: string, userAddress?: string) => {
      const contract = getReadOnlyContract();
      if (!contract) {
        throw new Error("Contract not available");
      }

      try {
        const address = userAddress || (await ethersSigner?.getAddress());
        if (!address) {
          throw new Error("User address not available");
        }

        const [isParticipantResult, hasVotedResult] = await Promise.all([
          contract.isParticipant(roomCode, address),
          contract.hasVoted(roomCode, address),
        ]);

        return {
          isParticipant: isParticipantResult,
          hasVoted: hasVotedResult,
        };
      } catch (error) {
        console.error("Error checking participant status:", error);
        throw error;
      }
    },
    [getReadOnlyContract, ethersSigner]
  );

  // Get room password hash for frontend validation (read-only, no transaction)
  const getRoomPasswordHash = useCallback(
    async (roomCode: string) => {
      const contract = getReadOnlyContract();
      if (!contract) {
        throw new Error("Contract not available");
      }

      try {
        const room = await contract.getRoom(roomCode);
        return {
          hasPassword: room.hasPassword,
          passwordHash: room.hasPassword ? room.passwordHash : null,
        };
      } catch (error) {
        console.error("Error getting room password hash:", error);
        throw error;
      }
    },
    [getReadOnlyContract]
  );

  // Validate password locally using keccak256 (no transaction)
  const validatePasswordLocally = useCallback(
    (password: string, passwordHash: string): boolean => {
      try {
        // Use ethers.js to compute keccak256 hash
        const providedHash = ethers.keccak256(ethers.toUtf8Bytes(password));
        return providedHash === passwordHash;
      } catch (error) {
        console.error("Error validating password locally:", error);
        return false;
      }
    },
    []
  );

  return {
    // State
    isLoading,
    message,
    contractAddress: votingRoomAddress,

    // Actions
    createRoom,
    createRoomWithCandidates,
    createRoomWithCandidatesBatchSingle,
    addCandidate,
    joinRoom,
    castVote,
    getRoomInfo,
    getCandidates,
    checkVotingStatus,

    // Room enumeration
    getTotalRoomsCount,
    getAllRoomCodes,
    getActiveRooms,
    getRoomsPaginated,
    getFeaturedRooms,

    // Gasless transaction helpers
    checkParticipantStatus,
    getRoomPasswordHash,
    validatePasswordLocally,

    // Utils
    setMessage,
  };
};
