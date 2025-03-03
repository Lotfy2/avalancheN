import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { connectWallet, getPlayerScore, checkUserBadges } from '../utils/web3Utils';
import { Wallet, LogOut, Award, ChevronDown, ChevronUp, Snowflake } from 'lucide-react';

const WalletConnect: React.FC = () => {
  const { isWalletConnected, walletAddress, connectWallet: setWalletConnected, disconnectWallet } = useGameStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletInfo, setShowWalletInfo] = useState(false);
  const [playerScore, setPlayerScore] = useState<any>(null);
  const [playerBadges, setPlayerBadges] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      const address = await connectWallet();
      if (address) {
        setWalletConnected(address);
        
        // Fetch player's score and badges
        try {
          const score = await getPlayerScore(address);
          setPlayerScore(score);
        } catch (error) {
          console.error('Error fetching player score:', error);
        }
        
        try {
          const badges = await checkUserBadges(address);
          setPlayerBadges(badges);
        } catch (error) {
          console.error('Error fetching player badges:', error);
        }
      } else {
        setConnectionError("Failed to connect wallet. Please make sure MetaMask is installed and unlocked.");
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnectionError("Error connecting to wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = () => {
    disconnectWallet();
    setPlayerScore(null);
    setPlayerBadges([]);
    setShowWalletInfo(false);
  };
  
  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Get badge name
  const getBadgeName = (badgeType: string) => {
    switch (badgeType) {
      case 'color-master':
        return 'Color Master';
      case 'pattern-master':
        return 'Pattern Master';
      case 'efficiency-expert':
        return 'Efficiency Expert';
      default:
        return 'Unknown Badge';
    }
  };
  
  return (
    <div className="relative">
      {isWalletConnected ? (
        <div>
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => setShowWalletInfo(!showWalletInfo)}
          >
            <div className="bg-[#0f172a] text-[#e84142] text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center mr-2 border border-[#e84142]">
              <span className="w-2 h-2 bg-[#10b981] rounded-full mr-1"></span>
              {formatAddress(walletAddress || '')}
              {showWalletInfo ? (
                <ChevronUp className="w-3 h-3 ml-1" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-1" />
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDisconnect();
              }}
              className="text-gray-300 hover:text-white transition-colors"
              title="Disconnect wallet"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          
          {showWalletInfo && (
            <div className="absolute right-0 mt-2 w-64 bg-[#1e293b] rounded-md shadow-lg z-10 border border-[#e84142]">
              <div className="p-3">
                <div className="text-sm font-medium text-white mb-2">Wallet Info</div>
                <div className="text-xs text-gray-300 mb-2 break-all">
                  {walletAddress}
                </div>
                
                {playerScore ? (
                  <div className="mb-2">
                    <div className="text-xs font-medium text-gray-300">Your Best Score</div>
                    <div className="text-sm font-bold text-[#e84142]">{playerScore.score}</div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 mb-2">No scores recorded yet</div>
                )}
                
                {playerBadges.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-300 mb-1">Your Badges</div>
                    <div className="space-y-1">
                      {playerBadges.map((badge, index) => (
                        <div key={index} className="flex items-center text-xs text-gray-300">
                          <Award className="w-3 h-3 text-[#fbbf24] mr-1" />
                          {getBadgeName(badge)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-3 pt-2 border-t border-[#2d3748]">
                  <button
                    onClick={handleDisconnect}
                    className="w-full text-xs text-[#e84142] hover:text-[#c5383a] flex items-center justify-center"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`bg-[#e84142] hover:bg-[#c5383a] text-white py-1 px-3 rounded-md text-sm flex items-center transition-colors ${
              isConnecting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-1" />
                Connect Wallet
              </>
            )}
          </button>
          
          {connectionError && (
            <div className="absolute right-0 mt-2 w-64 bg-[#450a0a] text-white text-xs p-2 rounded-md border border-[#b91c1c]">
              {connectionError}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;