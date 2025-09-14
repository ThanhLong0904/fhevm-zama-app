import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  ArrowLeft,
  Vote,
  Users,
  Clock,
  Shield,
  Trophy,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { useVotingRoom } from "@/hooks/useVotingRoom";
import { useFhevm } from "@/fhevm/useFhevm";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";

interface Candidate {
  id: string;
  name: string;
  description: string;
  image: string;
  votes: number;
  percentage: number;
}

interface RoomVotingPageProps {
  onNavigate: (page: string, data?: any) => void;
  roomCode?: string;
}

export function RoomVotingPage({ onNavigate, roomCode }: RoomVotingPageProps) {
  const [room, setRoom] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [hasVoted, setHasVoted] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState(0);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const hasLoadedRef = useRef(false);

  // FHE and Web3 hooks
    const {
    provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    initialMockChains,
  } = useMetaMaskEthersSigner();
  const {
    instance: fhevmInstance,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true, // use enabled to dynamically create the instance on-demand
  });
  
  // VotingRoom hook
  const votingRoom = useVotingRoom({
    instance: fhevmInstance,
    ethersSigner,
    ethersReadonlyProvider,
    chainId,
  });

  // Load room data on component mount
  useEffect(() => {
    const loadRoomData = async () => {
      if (!roomCode || hasLoadedRef.current) return;

      try {
        // Get room information
        const roomInfo = await votingRoom.getRoomInfo(roomCode);
        if (roomInfo) {
          setRoom({
            code: roomInfo.code,
            title: roomInfo.title,
            description: roomInfo.description,
            maxParticipants: roomInfo.maxParticipants,
            participants: roomInfo.participantCount,
            status: roomInfo.isActive ? "active" : "ended",
            endTime: new Date(roomInfo.endTime * 1000),
            createdAt: new Date(),
          });
          setCurrentParticipants(roomInfo.participantCount);
        }

        // Get candidates
        const candidatesList = await votingRoom.getCandidates(roomCode);
        setCandidates(candidatesList.map(c => ({
          id: c.id.toString(),
          name: c.name,
          description: c.description,
          image: c.imageUrl,
          votes: 0,
          percentage: 0,
        })));

        // Check voting status
        const { hasVoted: userHasVoted, isParticipant: userIsParticipant } = await votingRoom.checkVotingStatus(roomCode);
        setHasVoted(userHasVoted);
        setIsParticipant(userIsParticipant);
        setShowResults(userHasVoted);

        hasLoadedRef.current = true;

      } catch (error) {
        console.error("Error loading room data:", error);
      }
    };

    loadRoomData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]); // Only depend on roomCode to prevent infinite loop

  // Separate effect for updating results when voted
  useEffect(() => {
    if (hasVoted) {
      // Update candidates with simulated vote results
      setCandidates((prev) =>
        prev.map((candidate, index) => {
          const simulatedVotes = [7, 3, 2][index] || 0;
          const totalVotes = 12;
          return {
            ...candidate,
            votes: simulatedVotes,
            percentage: (simulatedVotes / totalVotes) * 100,
          };
        })
      );
      setShowResults(true);
    }
  }, [hasVoted]); // Chỉ chạy khi hasVoted thay đổi

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      if (room?.endTime) {
        const now = new Date().getTime();
        const endTime = new Date(room.endTime).getTime();
        const difference = endTime - now;

        if (difference > 0) {
          const hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft("Ended");
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [room]);

  const handleVote = async () => {
    if (!selectedCandidate || !roomCode) return;

    setIsVoting(true);

    try {
      const candidateId = parseInt(selectedCandidate);
      console.log("🗳️ Casting vote for candidate ID:", candidateId);
      
      const success = await votingRoom.castVote(roomCode, candidateId);

      if (success) {
        setHasVoted(true);
        setShowResults(true);
        setCurrentParticipants((prev) => prev + 1);
        
        // Note: With FHE, we can't immediately see vote counts
        // In a real implementation, you might want to show a success message
        // and let users know results will be available after voting ends
        alert("Vote cast successfully! 🎉");
      } else {
        const errorMessage = votingRoom.message || "Unknown error occurred while casting vote";
        console.error("Failed to cast vote:", errorMessage);
        // You might want to show a toast notification here
        alert(`Vote failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error casting vote:", error);
      alert(`Unexpected error: ${error}`);
    } finally {
      setIsVoting(false);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room?.code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = async () => {
    if (!roomCode) return;

    setIsJoining(true);
    try {
      const success = await votingRoom.joinRoom(roomCode, ""); // Empty password for now
      
      if (success) {
        setIsParticipant(true);
        alert("Successfully joined the room! 🎉");
      } else {
        const errorMessage = votingRoom.message || "Failed to join room";
        alert(`Join failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert(`Join error: ${error}`);
    } finally {
      setIsJoining(false);
    }
  };

  const getWinner = () => {
    return candidates.reduce((prev, current) =>
      prev.votes > current.votes ? prev : current
    );
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading voting room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F23] py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => onNavigate("home")}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl text-white">{room.title}</h1>
                <p className="text-gray-400">{room.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {room.status === "active" ? "Active" : "Ended"}
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Voting Area */}
            <div className="lg:col-span-3">
              {/* Room Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl text-blue-400 mb-1">
                      {room.code}
                    </div>
                    <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
                      Room Code
                      <Button
                        onClick={copyRoomCode}
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 text-gray-400 hover:text-white"
                      >
                        {copied ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl text-purple-400 mb-1">
                      {currentParticipants}/{room.maxParticipants}
                    </div>
                    <div className="text-sm text-gray-400">Participants</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl text-green-400 mb-1">
                      {candidates.length}
                    </div>
                    <div className="text-sm text-gray-400">Candidates</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl text-orange-400 mb-1">
                      {timeLeft}
                    </div>
                    <div className="text-sm text-gray-400">Time Left</div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Bar */}
              <Card className="bg-gray-800/50 border-gray-700/50 mb-8">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      Voting Progress
                    </span>
                    <span className="text-sm text-gray-400">
                      {Math.round(
                        (currentParticipants / room.maxParticipants) * 100
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(currentParticipants / room.maxParticipants) * 100}
                    className="h-2"
                  />
                </CardContent>
              </Card>

              {/* Join Room Status */}
              {!isParticipant && (
                <Card className="bg-yellow-500/10 border-yellow-500/30 mb-8">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-full">
                          <Users className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <div className="text-yellow-400">
                            You need to join this room to vote
                          </div>
                          <div className="text-sm text-yellow-300/70">
                            Click the button to become a participant
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={handleJoinRoom}
                        disabled={isJoining}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                      >
                        {isJoining ? "Joining..." : "Join Room"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Voting Status */}
              {hasVoted && (
                <Card className="bg-green-500/10 border-green-500/30 mb-8">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-full">
                        <Check className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-green-400">
                          You have voted successfully!
                        </div>
                        <div className="text-sm text-green-300/70">
                          Your vote has been encrypted and recorded securely
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Candidates */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl text-white">Candidates</h2>
                  {showResults && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Eye className="w-4 h-4" />
                      Current Results
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {candidates.map((candidate) => {
                    const isSelected = selectedCandidate === candidate.id;
                    const isWinner =
                      showResults && candidate.id === getWinner().id;

                    return (
                      <Card
                        key={candidate.id}
                        className={`transition-all duration-300 cursor-pointer ${
                          hasVoted
                            ? "bg-gray-800/50 border-gray-700/50"
                            : isSelected
                            ? "bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20"
                            : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50"
                        } ${isWinner ? "ring-2 ring-yellow-500/50" : ""}`}
                        onClick={() =>
                          !hasVoted && setSelectedCandidate(candidate.id)
                        }
                      >
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="relative">
                              <ImageWithFallback
                                src={candidate.image}
                                alt={candidate.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              {isWinner && (
                                <div className="absolute -top-2 -right-2 p-1 bg-yellow-500 rounded-full">
                                  <Trophy className="w-4 h-4 text-yellow-900" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-white text-lg">
                                  {candidate.name}
                                </h3>
                                {isSelected && !hasVoted && (
                                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    Selected
                                  </Badge>
                                )}
                              </div>

                              <p className="text-gray-400 text-sm mb-3">
                                {candidate.description}
                              </p>

                              {showResults && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">
                                      <span className="text-gray-400">
                                        {candidate.votes} votes
                                      </span>
                                    </span>
                                    <span className="text-gray-400">
                                      {candidate.percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={candidate.percentage}
                                    className="h-2"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Vote Button */}
                {!hasVoted && (
                  <div className="text-center">
                    <Button
                      onClick={handleVote}
                      disabled={!selectedCandidate || isVoting || !isParticipant}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                    >
                      {isVoting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Vote className="w-5 h-5 mr-2" />
                          {!isParticipant ? "Join Room First" : "Vote"}
                        </>
                      )}
                    </Button>
                    {selectedCandidate && isParticipant && (
                      <p className="text-sm text-gray-400 mt-2">
                        Bạn đang chọn:{" "}
                        <span className="text-white">
                          {
                            candidates.find((c) => c.id === selectedCandidate)
                              ?.name
                          }
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Security Info */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    FHE Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Votes are fully encrypted
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    No one knows who you voted for
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Transparent results
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Blockchain verification
                  </div>
                </CardContent>
              </Card>

              {/* Voting Process */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Voting Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div
                    className={`flex items-center gap-2 ${
                      hasVoted ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        hasVoted
                          ? "border-green-400 bg-green-400/20"
                          : "border-gray-600"
                      }`}
                    >
                      {hasVoted ? <Check className="w-3 h-3" /> : "1"}
                    </div>
                    Select candidate
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      hasVoted ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        hasVoted
                          ? "border-green-400 bg-green-400/20"
                          : "border-gray-600"
                      }`}
                    >
                      {hasVoted ? <Check className="w-3 h-3" /> : "2"}
                    </div>
                    FHE Encryption
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      hasVoted ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        hasVoted
                          ? "border-green-400 bg-green-400/20"
                          : "border-gray-600"
                      }`}
                    >
                      {hasVoted ? <Check className="w-3 h-3" /> : "3"}
                    </div>
                    Submit to Blockchain
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      showResults ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        showResults
                          ? "border-green-400 bg-green-400/20"
                          : "border-gray-600"
                      }`}
                    >
                      {showResults ? <Check className="w-3 h-3" /> : "4"}
                    </div>
                    Publish results
                  </div>
                </CardContent>
              </Card>

              {/* Room Info */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Room Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created by:</span>
                    <span className="text-white">Admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created at:</span>
                    <span className="text-white">
                      {room.createdAt.toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
