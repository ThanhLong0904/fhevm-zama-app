import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Vote, Shield, Users, ArrowRight, Plus, Search, Zap, Lock, X, AlertCircle } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [roomCode, setRoomCode] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [roomPassword, setRoomPassword] = useState('');

  const featuredRooms = [
    {
      id: 'ROOM001',
      title: 'Marketing Team Leader Election',
      description: 'Choose the marketing team leader for Q4 2024',
      participants: 12,
      maxParticipants: 15,
      status: 'active',
      endTime: '2 hours left',
      hasPassword: false
    },
    {
      id: 'ROOM002', 
      title: 'Creative Ideas Contest',
      description: 'Vote for the best new product idea',
      participants: 8,
      maxParticipants: 20,
      status: 'active',
      endTime: '1 day left',
      hasPassword: false
    },
    {
      id: 'ROOM003',
      title: 'Team Building Location',
      description: 'Decide the destination for team building trip',
      participants: 25,
      maxParticipants: 25,
      status: 'completed',
      endTime: 'Completed',
      hasPassword: false
    },
    {
      id: 'ROOM004',
      title: 'Executive Board Selection',
      description: 'Private voting for board member positions',
      participants: 3,
      maxParticipants: 8,
      status: 'active',
      endTime: '5 hours left',
      hasPassword: true,
      password: 'exec2024'
    }
  ];

  // Mock existing room codes for validation
  const existingRoomCodes = ['ROOM001', 'ROOM002', 'ROOM003', 'ROOM004'];

  const handleJoinRoom = () => {
    const trimmedCode = roomCode.trim().replace('#', ''); // Remove # if present
    if (trimmedCode) {
      // Check if room exists
      if (existingRoomCodes.includes(trimmedCode)) {
        const room = featuredRooms.find(r => r.id === trimmedCode);
        if (room?.hasPassword) {
          setSelectedRoom(room);
          setShowPasswordDialog(true);
        } else {
          onNavigate('voting', { roomCode: trimmedCode });
        }
      } else {
        setErrorMessage(`Room "${trimmedCode}" does not exist. Please check the room code and try again.`);
        setShowError(true);
      }
    }
  };

  const handleRoomCardClick = (room: any) => {
    if (room.hasPassword && room.status === 'active') {
      setSelectedRoom(room);
      setShowPasswordDialog(true);
    } else {
      onNavigate('voting', { roomCode: room.id });
    }
  };

  const handlePasswordSubmit = () => {
    if (selectedRoom && roomPassword === selectedRoom.password) {
      setShowPasswordDialog(false);
      setRoomPassword('');
      onNavigate('voting', { roomCode: selectedRoom.id });
    } else {
      setErrorMessage('Incorrect password. Please try again.');
      setShowError(true);
      setRoomPassword('');
    }
  };

  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);
    setSelectedRoom(null);
    setRoomPassword('');
  };

  const dismissError = () => {
    setShowError(false);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#0F0F23]">
      {/* Error Alert */}
      {showError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Alert className="bg-red-500/10 border-red-500/30 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="pr-8">
              {errorMessage}
            </AlertDescription>
            <Button
              onClick={dismissError}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                <Vote className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-6xl text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Private</span> Voting
              <br />with <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">FHE</span> Technology
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Decentralized voting platform with Fully Homomorphic Encryption (FHE) technology, 
              ensuring absolute privacy and transparency for all elections.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button 
                onClick={() => onNavigate('create')}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Room
              </Button>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Enter room code..."
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
                <Button 
                  onClick={handleJoinRoom}
                  variant="outline"
                  className="border-gray-600/50 text-gray-300 hover:bg-white/10 hover:border-white/50 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Join
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl text-white mb-4">Why Choose Us?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Blockchain technology combined with FHE delivers the safest and most transparent voting experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Shield,
              title: 'Absolute Security',
              description: 'FHE technology ensures votes are encrypted end-to-end',
              gradient: 'from-blue-500 to-cyan-500'
            },
            {
              icon: Lock,
              title: 'Complete Privacy', 
              description: 'No one can know who you voted for, not even administrators',
              gradient: 'from-purple-500 to-pink-500'
            },
            {
              icon: Zap,
              title: 'Instant Results',
              description: 'View real-time results without revealing personal information',
              gradient: 'from-green-500 to-emerald-500'
            }
          ].map((feature, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className={`inline-flex p-3 bg-gradient-to-r ${feature.gradient} rounded-lg mb-4 mx-auto`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Rooms */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl text-white mb-2">Featured Voting Rooms</h2>
            <p className="text-gray-400">Join ongoing voting sessions</p>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6">
          {featuredRooms.map((room, index) => (
            <Card key={room.id} className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={room.status === 'active' ? 'default' : room.status === 'completed' ? 'secondary' : 'outline'}
                      className={
                        room.status === 'active' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : room.status === 'completed'
                          ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          : ''
                      }
                    >
                      {room.status === 'active' ? 'Active' : 'Completed'}
                    </Badge>
                    {room.hasPassword && (
                      <Badge variant="outline" className="border-yellow-600/50 text-yellow-400">
                        <Lock className="w-3 h-3 mr-1" />
                        Protected
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">#{room.id}</span>
                </div>
                <CardTitle className="text-white hover:text-blue-400 transition-colors">
                  {room.title}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {room.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{room.participants}/{room.maxParticipants} people</span>
                    </div>
                    <span className="text-gray-500">{room.endTime}</span>
                  </div>
                  
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(room.participants / room.maxParticipants) * 100}%` }}
                    ></div>
                  </div>
                  
                  <Button 
                    onClick={() => handleRoomCardClick(room)}
                    variant="ghost"
                    className="w-full text-gray-300 hover:text-white hover:bg-blue-500/10 transition-all duration-200 flex items-center justify-between"
                    disabled={room.status === 'completed'}
                  >
                    {room.status === 'active' ? (room.hasPassword ? 'Join with Password' : 'Join Voting') : 'View Results'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Total Votes', value: '15,420', color: 'text-blue-400' },
              { label: 'Active Rooms', value: '342', color: 'text-green-400' },
              { label: 'Users', value: '8,234', color: 'text-purple-400' },
              { label: 'Security Rate', value: '100%', color: 'text-pink-400' }
            ].map((stat, index) => (
              <div key={index}>
                <div className={`text-3xl mb-2 ${stat.color}`}>{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={handlePasswordDialogClose}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-yellow-400" />
              Password Required
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This room is password protected. Please enter the password to join "{selectedRoom?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Room Password</Label>
              <Input
                type="password"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                placeholder="Enter room password..."
                className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handlePasswordDialogClose}
              variant="outline"
              className="border-gray-600/50 text-gray-300 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Join Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}