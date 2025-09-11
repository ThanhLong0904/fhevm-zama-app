import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { CreateRoomPage } from './components/CreateRoomPage';
import { RoomVotingPage } from './components/RoomVotingPage';
import { DashboardPage } from './components/DashboardPage';
import { Vote, Wallet, Menu, X, LayoutDashboard } from 'lucide-react';
import { Button } from './components/ui/button';

type Page = 'home' | 'create' | 'voting' | 'dashboard';

interface NavigationData {
  roomCode?: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [navigationData, setNavigationData] = useState<NavigationData>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleNavigate = (page: Page, data?: NavigationData) => {
    setCurrentPage(page);
    if (data) {
      setNavigationData(data);
    }
    setIsMenuOpen(false);
  };

  const connectWallet = async () => {
    // Simulate wallet connection
    setIsWalletConnected(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'create':
        return <CreateRoomPage onNavigate={handleNavigate} />;
      case 'voting':
        return <RoomVotingPage onNavigate={handleNavigate} roomCode={navigationData.roomCode} />;
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F23]">
      {/* Navigation Header */}
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => handleNavigate('home')}
            >
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-white text-lg">VoteFHE</span>
                <div className="text-xs text-gray-400">Private Voting</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => handleNavigate('home')}
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 'home' 
                    ? 'text-white bg-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigate('create')}
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === 'create' 
                    ? 'text-white bg-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Create Room
              </button>
              <button
                onClick={() => handleNavigate('dashboard')}
                className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  currentPage === 'dashboard' 
                    ? 'text-white bg-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            </div>

            {/* Wallet Connection */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                onClick={connectWallet}
                variant={isWalletConnected ? "secondary" : "outline"}
                className={
                  isWalletConnected 
                    ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" 
                    : "border-gray-600/50 text-gray-300 hover:bg-white/10 hover:border-white/50"
                }
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isWalletConnected ? 'Connected' : 'Connect Wallet'}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-700/50">
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigate('home')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === 'home' 
                      ? 'text-white bg-white/10' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavigate('create')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === 'create' 
                      ? 'text-white bg-white/10' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Create Room
                </button>
                <button
                  onClick={() => handleNavigate('dashboard')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    currentPage === 'dashboard' 
                      ? 'text-white bg-white/10' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <div className="pt-2 border-t border-gray-700/50">
                  <Button
                    onClick={connectWallet}
                    variant={isWalletConnected ? "secondary" : "outline"}
                    className={`w-full ${
                      isWalletConnected 
                        ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" 
                        : "border-gray-600/50 text-gray-300 hover:bg-white/10 hover:border-white/50"
                    }`}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isWalletConnected ? 'Connected' : 'Connect Wallet'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Vote className="w-5 h-5 text-white" />
                </div>
                <span className="text-white">VoteFHE</span>
              </div>
              <p className="text-gray-400 text-sm">
                Decentralized voting platform with FHE technology, ensuring absolute privacy and transparency.
              </p>
            </div>

            <div>
              <h3 className="text-white mb-4">Product</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Create Room</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Join Voting</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">View Results</a>
              </div>
            </div>

            <div>
              <h3 className="text-white mb-4">Technology</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">FHE Encryption</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Blockchain</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Smart Contracts</a>
              </div>
            </div>

            <div>
              <h3 className="text-white mb-4">Support</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Documentation</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">FAQ</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors block">Contact</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700/50 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 VoteFHE. All rights reserved. Built with ❤️ and blockchain technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}