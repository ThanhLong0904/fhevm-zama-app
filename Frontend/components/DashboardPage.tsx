import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  ArrowLeft,
  Calendar,
  Users,
  Vote,
  Bell,
  Trophy,
  Clock,
  Eye,
  BarChart3,
  TrendingUp,
} from "lucide-react";

interface DashboardPageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface Room {
  id: string;
  title: string;
  code: string;
  status: "active" | "completed" | "upcoming";
  participantCount: number;
  maxParticipants: number;
  myRole: "creator" | "participant";
  createdAt: Date;
  endTime?: Date;
  hasPassword: boolean;
}

interface VoteHistory {
  id: string;
  roomCode: string;
  roomTitle: string;
  votedAt: Date;
  candidate: string;
  status: "completed" | "pending";
}

interface Notification {
  id: string;
  type: "result" | "room_full" | "room_ending" | "new_room";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  roomCode?: string;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  // Mock data for demonstration
  const [rooms] = useState<Room[]>([
    {
      id: "1",
      title: "Marketing Team Leader Election",
      code: "ROOM001",
      status: "active",
      participantCount: 12,
      maxParticipants: 15,
      myRole: "creator",
      createdAt: new Date("2024-01-15"),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      hasPassword: false,
    },
    {
      id: "2",
      title: "Creative Ideas Contest",
      code: "ROOM002",
      status: "active",
      participantCount: 8,
      maxParticipants: 20,
      myRole: "participant",
      createdAt: new Date("2024-01-14"),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      hasPassword: true,
    },
    {
      id: "3",
      title: "Team Building Location Vote",
      code: "ROOM003",
      status: "completed",
      participantCount: 25,
      maxParticipants: 25,
      myRole: "participant",
      createdAt: new Date("2024-01-10"),
      endTime: new Date("2024-01-12"),
      hasPassword: false,
    },
    {
      id: "4",
      title: "Product Feature Priority",
      code: "ROOM004",
      status: "upcoming",
      participantCount: 0,
      maxParticipants: 10,
      myRole: "creator",
      createdAt: new Date("2024-01-16"),
      endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      hasPassword: true,
    },
  ]);

  const [voteHistory] = useState<VoteHistory[]>([
    {
      id: "1",
      roomCode: "ROOM002",
      roomTitle: "Creative Ideas Contest",
      votedAt: new Date("2024-01-14T15:30:00"),
      candidate: "Sarah Johnson",
      status: "pending",
    },
    {
      id: "2",
      roomCode: "ROOM003",
      roomTitle: "Team Building Location Vote",
      votedAt: new Date("2024-01-11T09:15:00"),
      candidate: "Beach Resort",
      status: "completed",
    },
    {
      id: "3",
      roomCode: "ROOM005",
      roomTitle: "Q4 Project Lead Selection",
      votedAt: new Date("2024-01-08T14:45:00"),
      candidate: "Alex Chen",
      status: "completed",
    },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "result",
      title: "Voting Results Available",
      message:
        "Team Building Location Vote results are now available. Beach Resort won with 60% votes.",
      timestamp: new Date("2024-01-12T10:00:00"),
      read: false,
      roomCode: "ROOM003",
    },
    {
      id: "2",
      type: "room_full",
      title: "Room Almost Full",
      message:
        "Marketing Team Leader Election is almost full (12/15 participants).",
      timestamp: new Date("2024-01-15T16:30:00"),
      read: false,
      roomCode: "ROOM001",
    },
    {
      id: "3",
      type: "room_ending",
      title: "Voting Ending Soon",
      message:
        "Creative Ideas Contest voting ends in 24 hours. Make sure to cast your vote!",
      timestamp: new Date("2024-01-14T20:00:00"),
      read: true,
      roomCode: "ROOM002",
    },
    {
      id: "4",
      type: "new_room",
      title: "New Voting Room",
      message:
        "You have been invited to participate in Product Feature Priority voting.",
      timestamp: new Date("2024-01-16T08:00:00"),
      read: true,
      roomCode: "ROOM004",
    },
  ]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "completed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      case "upcoming":
        return "Upcoming";
      default:
        return "Unknown";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "result":
        return Trophy;
      case "room_full":
        return Users;
      case "room_ending":
        return Clock;
      case "new_room":
        return Vote;
      default:
        return Bell;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0F0F23] py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => onNavigate("home")}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl text-white">Dashboard</h1>
              <p className="text-gray-400">
                Manage your voting activities and track room performance
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl text-blue-400 mb-1">
                      {rooms.length}
                    </div>
                    <div className="text-sm text-gray-400">Total Rooms</div>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl text-green-400 mb-1">
                      {rooms.filter((r) => r.myRole === "creator").length}
                    </div>
                    <div className="text-sm text-gray-400">Created by Me</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl text-purple-400 mb-1">
                      {voteHistory.length}
                    </div>
                    <div className="text-sm text-gray-400">Votes Cast</div>
                  </div>
                  <Vote className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl text-orange-400 mb-1">
                      {unreadCount}
                    </div>
                    <div className="text-sm text-gray-400">
                      Unread Notifications
                    </div>
                  </div>
                  <Bell className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="rooms" className="space-y-6">
            <TabsList className="bg-gray-800/50 border-gray-700/50">
              <TabsTrigger
                value="rooms"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                My Rooms
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                Vote History
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                Notifications{" "}
                {unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Rooms Tab */}
            <TabsContent value="rooms" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl text-white">My Voting Rooms</h2>
                <Button
                  onClick={() => onNavigate("create")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Create New Room
                </Button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {rooms.map((room) => (
                  <Card
                    key={room.id}
                    className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(room.status)}>
                            {getStatusText(room.status)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-gray-600/50 text-gray-300"
                          >
                            {room.myRole === "creator"
                              ? "Creator"
                              : "Participant"}
                          </Badge>
                          {room.hasPassword && (
                            <Badge
                              variant="outline"
                              className="border-yellow-600/50 text-yellow-400"
                            >
                              Protected
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          #{room.code}
                        </span>
                      </div>
                      <CardTitle className="text-white hover:text-blue-400 transition-colors">
                        {room.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Created on {room.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>
                              {room.participantCount}/{room.maxParticipants}{" "}
                              participants
                            </span>
                          </div>
                          {room.endTime && (
                            <div className="flex items-center gap-2 text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>
                                {room.status === "completed" ? "Ended" : "Ends"}{" "}
                                {room.endTime.toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                (room.participantCount / room.maxParticipants) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              onNavigate("voting", { roomCode: room.code })
                            }
                            variant="ghost"
                            className="flex-1 text-gray-300 hover:text-white hover:bg-blue-500/10 transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            {room.status === "completed"
                              ? "View Results"
                              : "View Room"}
                          </Button>
                          {room.myRole === "creator" &&
                            room.status === "active" && (
                              <Button
                                variant="outline"
                                className="border-gray-600/50 text-gray-300 hover:bg-white/10"
                              >
                                Manage
                              </Button>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Vote History Tab */}
            <TabsContent value="history" className="space-y-6">
              <h2 className="text-xl text-white">Voting History</h2>

              <div className="space-y-4">
                {voteHistory.map((vote) => (
                  <Card
                    key={vote.id}
                    className="bg-gray-800/50 border-gray-700/50"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white">{vote.roomTitle}</h3>
                            <Badge
                              className={
                                vote.status === "completed"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              }
                            >
                              {vote.status === "completed"
                                ? "Completed"
                                : "Pending"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400 mb-2">
                            Voted for:{" "}
                            <span className="text-white">{vote.candidate}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Room: #{vote.roomCode}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {vote.votedAt.toLocaleDateString()} at{" "}
                              {vote.votedAt.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() =>
                            onNavigate("voting", { roomCode: vote.roomCode })
                          }
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <h2 className="text-xl text-white">Notifications</h2>

              <div className="space-y-4">
                {notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  return (
                    <Card
                      key={notification.id}
                      className={`transition-all duration-300 cursor-pointer ${
                        notification.read
                          ? "bg-gray-800/50 border-gray-700/50"
                          : "bg-blue-500/10 border-blue-500/30"
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div
                            className={`p-2 rounded-lg ${
                              notification.read
                                ? "bg-gray-700/50"
                                : "bg-blue-500/20"
                            }`}
                          >
                            <IconComponent
                              className={`w-5 h-5 ${
                                notification.read
                                  ? "text-gray-400"
                                  : "text-blue-400"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3
                                className={
                                  notification.read
                                    ? "text-gray-300"
                                    : "text-white"
                                }
                              >
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {notification.timestamp.toLocaleDateString()}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                              {notification.message}
                            </p>
                            {notification.roomCode && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate("voting", {
                                    roomCode: notification.roomCode,
                                  });
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-0 h-auto"
                              >
                                View Room #{notification.roomCode}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
