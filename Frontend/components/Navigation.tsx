"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Vote, Wallet, Menu, X, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const connectWallet = async () => {
    // Simulate wallet connection
    setIsWalletConnected(true);
  };

  const handleNavigate = (page: string) => {
    router.push(page);
    setIsMenuOpen(false);
  };

  const getCurrentPage = () => {
    if (pathname === "/") return "home";
    if (pathname === "/create-room") return "create";
    if (pathname === "/dashboard") return "dashboard";
    return "";
  };

  const currentPage = getCurrentPage();

  return (
    <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => handleNavigate("/")}
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
              onClick={() => handleNavigate("/")}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === "home"
                  ? "text-white bg-white/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigate("/create-room")}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === "create"
                  ? "text-white bg-white/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Create Room
            </button>
            <button
              onClick={() => handleNavigate("/dashboard")}
              className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                currentPage === "dashboard"
                  ? "text-white bg-white/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
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
              {isWalletConnected ? "Connected" : "Connect Wallet"}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700/50">
            <div className="space-y-2">
              <button
                onClick={() => handleNavigate("/")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === "home"
                    ? "text-white bg-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigate("/create-room")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentPage === "create"
                    ? "text-white bg-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Create Room
              </button>
              <button
                onClick={() => handleNavigate("/dashboard")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  currentPage === "dashboard"
                    ? "text-white bg-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
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
                  {isWalletConnected ? "Connected" : "Connect Wallet"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
