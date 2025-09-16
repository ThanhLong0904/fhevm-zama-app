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
    // Deployed address on localhost (updated with createRoomWithCandidatesBatch)
    return "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  }, []);

  // Contract ABI imported from generated files
  const contractABI = VotingRoomABI;

  // Get contract instance
  const getContract = useCallback(() => {
    if (!ethersSigner || !votingRoomAddress) return null;
    return new ethers.Contract(
      votingRoomAddress,
      contractABI.abi,
      ethersSigner
    );
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
        setMessage("Contract or signer not available");
        return false;
      }

      setIsLoading(true);
      setMessage("Creating room with candidates in single transaction...");

      try {
        const endTime = Math.floor(Date.now() / 1000) + (endHours * 60 * 60);
        let passwordHash = ethers.ZeroHash;
        
        if (hasPassword && password) {
          passwordHash = ethers.keccak256(ethers.toUtf8Bytes(password));
        }

        // Extract arrays for batch creation
        const names = candidates.map(c => c.name);
        const descriptions = candidates.map(c => c.description);
        const images = candidates.map(c => c.image);

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
          setMessage("Room and candidates created successfully in one transaction!");
          return true;
        } else {
          setMessage("Room creation failed");
          return false;
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setMessage(`Error creating room: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [getContract]
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
        return false;
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
          return false;
        }
      } catch (error: unknown) {
        setMessage(
          `Error joining room: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return false;
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

    // Utils
    setMessage,
  };
};
