import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Vote, Shield, Users, ArrowRight, Plus, Search, Zap, Lock } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [roomCode, setRoomCode] = useState('');

  const featuredRooms = [
    {
      id: 'ROOM001',
      title: 'Bầu chọn Leader Team Marketing',
      description: 'Lựa chọn trưởng nhóm marketing cho quý 4/2024',
      participants: 12,
      maxParticipants: 15,
      status: 'active',
      endTime: '2 giờ nữa'
    },
    {
      id: 'ROOM002', 
      title: 'Cuộc thi Ý tướng Sáng tạo',
      description: 'Bình chọn ý tướng sản phẩm mới xuất sắc nhất',
      participants: 8,
      maxParticipants: 20,
      status: 'active',
      endTime: '1 ngày nữa'
    },
    {
      id: 'ROOM003',
      title: 'Chọn địa điểm Team Building',
      description: 'Quyết định điểm đến cho chuyến team building',
      participants: 25,
      maxParticipants: 25,
      status: 'completed',
      endTime: 'Đã kết thúc'
    }
  ];

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      onNavigate('voting', { roomCode: roomCode.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F23]">
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
              Bỏ phiếu <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Bí mật</span>
              <br />Công nghệ <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">FHE</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Nền tảng bỏ phiếu phi tập trung với công nghệ mã hóa đồng cấu hoàn toàn (FHE), 
              đảm bảo tính riêng tư và minh bạch tuyệt đối cho mọi cuộc bầu cử.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button 
                onClick={() => onNavigate('create')}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Tạo phòng mới
              </Button>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Nhập mã phòng..."
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
                  Tham gia
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl text-white mb-4">Tại sao chọn chúng tôi?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Công nghệ blockchain kết hợp FHE mang đến trải nghiệm bỏ phiếu an toàn và minh bạch nhất
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Shield,
              title: 'Bảo mật tuyệt đối',
              description: 'Công nghệ FHE đảm bảo phiếu bầu được mã hóa từ đầu đến cuối',
              gradient: 'from-blue-500 to-cyan-500'
            },
            {
              icon: Lock,
              title: 'Riêng tư hoàn toàn', 
              description: 'Không ai có thể biết bạn bỏ phiếu cho ai, kể cả quản trị viên',
              gradient: 'from-purple-500 to-pink-500'
            },
            {
              icon: Zap,
              title: 'Kết quả tức thì',
              description: 'Xem kết quả real-time mà không làm lộ thông tin cá nhân',
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
            <h2 className="text-3xl text-white mb-2">Phòng bỏ phiếu nổi bật</h2>
            <p className="text-gray-400">Tham gia các cuộc bỏ phiếu đang diễn ra</p>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {featuredRooms.map((room, index) => (
            <Card key={room.id} className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
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
                    {room.status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'}
                  </Badge>
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
                      <span>{room.participants}/{room.maxParticipants} người</span>
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
                    onClick={() => onNavigate('voting', { roomCode: room.id })}
                    variant="ghost"
                    className="w-full text-gray-300 hover:text-white hover:bg-blue-500/10 transition-all duration-200 flex items-center justify-between"
                    disabled={room.status === 'completed'}
                  >
                    {room.status === 'active' ? 'Tham gia bỏ phiếu' : 'Xem kết quả'}
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
              { label: 'Tổng số phiếu', value: '15,420', color: 'text-blue-400' },
              { label: 'Phòng hoạt động', value: '342', color: 'text-green-400' },
              { label: 'Người dùng', value: '8,234', color: 'text-purple-400' },
              { label: 'Tỷ lệ bảo mật', value: '100%', color: 'text-pink-400' }
            ].map((stat, index) => (
              <div key={index}>
                <div className={`text-3xl mb-2 ${stat.color}`}>{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}