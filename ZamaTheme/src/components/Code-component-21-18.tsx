import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Plus, X, Upload, Users, Clock, Shield, Copy, Check } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface CreateRoomPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function CreateRoomPage({ onNavigate }: CreateRoomPageProps) {
  const [roomCode, setRoomCode] = useState('');
  const [roomTitle, setRoomTitle] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [endTime, setEndTime] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const defaultImages = [
    "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhdmF0YXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTc0NzgxNzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1425421669292-0c3da3b8f529?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHBlcnNvbiUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NTc0ODE3NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1697551458746-b86ccf5049d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwcGVvcGxlJTIwcG9ydHJhaXRzfGVufDF8fHx8MTc1NzQ3NTEwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  ];

  const generateRoomCode = () => {
    const code = 'ROOM' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
  };

  const addCandidate = () => {
    const newCandidate: Candidate = {
      id: Date.now().toString(),
      name: '',
      description: '',
      image: defaultImages[candidates.length % defaultImages.length]
    };
    setCandidates([...candidates, newCandidate]);
  };

  const removeCandidate = (id: string) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  const updateCandidate = (id: string, field: keyof Candidate, value: string) => {
    setCandidates(candidates.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleCreateRoom = async () => {
    if (!roomCode || !roomTitle || !maxParticipants || candidates.length < 2) {
      return;
    }

    setIsCreating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newRoom = {
      code: roomCode,
      title: roomTitle,
      description: roomDescription,
      maxParticipants: parseInt(maxParticipants),
      endTime,
      candidates: candidates.filter(c => c.name.trim()),
      createdAt: new Date(),
      participants: 0,
      status: 'active'
    };
    
    setCreatedRoom(newRoom);
    setIsCreating(false);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(createdRoom?.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdRoom) {
    return (
      <div className="min-h-screen bg-[#0F0F23] py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-white">Tạo phòng thành công!</CardTitle>
                <CardDescription className="text-gray-400">
                  Phòng bỏ phiếu đã được tạo và sẵn sàng sử dụng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <Label className="text-gray-400 block mb-2">Mã phòng</Label>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl text-white font-mono">{createdRoom.code}</span>
                    <Button
                      onClick={copyRoomCode}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Chia sẻ mã này để mọi người tham gia</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="text-lg text-blue-400">{createdRoom.candidates.length}</div>
                    <div className="text-sm text-gray-400">Ứng viên</div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="text-lg text-purple-400">{createdRoom.maxParticipants}</div>
                    <div className="text-sm text-gray-400">Tối đa người tham gia</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => onNavigate('voting', { roomCode: createdRoom.code })}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Tham gia phòng
                  </Button>
                  <Button
                    onClick={() => onNavigate('home')}
                    variant="outline"
                    className="flex-1 border-gray-600/50 text-gray-300 hover:bg-white/10"
                  >
                    Về trang chủ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F23] py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => onNavigate('home')}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl text-white">Tạo phòng bỏ phiếu mới</h1>
              <p className="text-gray-400">Thiết lập cuộc bỏ phiếu với công nghệ FHE bảo mật</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Room Info */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Thông tin phòng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Mã phòng *</Label>
                      <div className="flex gap-2">
                        <Input
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          placeholder="VD: ROOM001"
                          className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-500"
                        />
                        <Button
                          onClick={generateRoomCode}
                          variant="outline"
                          className="border-gray-600/50 text-gray-300 hover:bg-white/10"
                        >
                          Tạo
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-300">Số người tối đa *</Label>
                      <Input
                        type="number"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(e.target.value)}
                        placeholder="VD: 20"
                        className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Tiêu đề cuộc bỏ phiếu *</Label>
                    <Input
                      value={roomTitle}
                      onChange={(e) => setRoomTitle(e.target.value)}
                      placeholder="VD: Bầu chọn trưởng nhóm dự án"
                      className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Mô tả</Label>
                    <Textarea
                      value={roomDescription}
                      onChange={(e) => setRoomDescription(e.target.value)}
                      placeholder="Mô tả chi tiết về cuộc bỏ phiếu..."
                      className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Thời gian kết thúc</Label>
                    <Input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-gray-700/50 border-gray-600/50 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Candidates */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      Danh sách ứng viên ({candidates.length})
                    </CardTitle>
                    <Button
                      onClick={addCandidate}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm ứng viên
                    </Button>
                  </div>
                  <CardDescription className="text-gray-400">
                    Cần ít nhất 2 ứng viên để tạo phòng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {candidates.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500">Chưa có ứng viên nào</p>
                      <Button
                        onClick={addCandidate}
                        variant="outline"
                        className="mt-4 border-gray-600/50 text-gray-300 hover:bg-white/10"
                      >
                        Thêm ứng viên đầu tiên
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {candidates.map((candidate, index) => (
                        <div key={candidate.id} className="bg-gray-700/30 rounded-lg p-4">
                          <div className="flex gap-4">
                            <div className="relative group">
                              <ImageWithFallback
                                src={candidate.image}
                                alt={candidate.name || `Ứng viên ${index + 1}`}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <Upload className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  value={candidate.name}
                                  onChange={(e) => updateCandidate(candidate.id, 'name', e.target.value)}
                                  placeholder={`Tên ứng viên ${index + 1}`}
                                  className="bg-gray-600/50 border-gray-500/50 text-white placeholder-gray-400"
                                />
                                <Button
                                  onClick={() => removeCandidate(candidate.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <Input
                                value={candidate.description}
                                onChange={(e) => updateCandidate(candidate.id, 'description', e.target.value)}
                                placeholder="Mô tả ngắn về ứng viên..."
                                className="bg-gray-600/50 border-gray-500/50 text-white placeholder-gray-400"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Preview */}
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Xem trước</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-lg text-white mb-1">
                      {roomTitle || 'Tiêu đề phòng'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {roomCode || 'MÃ PHÒNG'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                    <div className="text-2xl text-blue-400">{candidates.filter(c => c.name.trim()).length}</div>
                    <div className="text-sm text-gray-400">Ứng viên hợp lệ</div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Bảo mật FHE
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Mã hóa end-to-end
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Riêng tư hoàn toàn
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Kết quả minh bạch
                  </div>
                </CardContent>
              </Card>

              {/* Create Button */}
              <Button
                onClick={handleCreateRoom}
                disabled={!roomCode || !roomTitle || !maxParticipants || candidates.filter(c => c.name.trim()).length < 2 || isCreating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Đang tạo phòng...
                  </>
                ) : (
                  'Tạo phòng bỏ phiếu'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}