import React, { useState, useEffect } from 'react';
import { getLeaderboard, checkUserBadges } from '../utils/web3Utils';
import { useGameStore } from '../store/gameStore';
import { LeaderboardEntry } from '../types';
import { Trophy, Medal, User, Brain, Award, Star, Zap, Snowflake } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const { isWalletConnected, walletAddress } = useGameStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        const data = await getLeaderboard();
        setLeaderboard(data);
        
        // Find user's rank if connected
        if (isWalletConnected && walletAddress) {
          const userIndex = data.findIndex(entry => 
            entry.walletAddress.toLowerCase() === walletAddress.toLowerCase()
          );
          setUserRank(userIndex !== -1 ? userIndex + 1 : null);
          
          // Get user's badges
          try {
            const badges = await checkUserBadges(walletAddress);
            setUserBadges(badges);
          } catch (error) {
            console.error('Error fetching user badges:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLoadError("Failed to load leaderboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [isWalletConnected, walletAddress]);
  
  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Get badge icon
  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'color-master':
        return <Award className="w-4 h-4 text-orange-500" />;
      case 'pattern-master':
        return <Award className="w-4 h-4 text-indigo-500" />;
      case 'efficiency-expert':
        return <Zap className="w-4 h-4 text-blue-500" />;
      default:
        return <Medal className="w-4 h-4 text-gray-500" />;
    }
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
    <div className="bg-[#1e293b] rounded-lg shadow-lg p-6 border border-[#e84142]">
      <div className="flex items-center mb-4">
        <Snowflake className="w-6 h-6 mr-2 text-[#e84142]" />
        <h2 className="text-xl font-bold text-white">Avalanche Leaderboard</h2>
      </div>
      
      {loadError && (
        <div className="mb-4 bg-[#450a0a] border border-[#b91c1c] text-white px-4 py-3 rounded-md">
          {loadError}
        </div>
      )}
      
      {isWalletConnected && userBadges.length > 0 && (
        <div className="bg-[#0f172a] p-4 rounded-lg mb-6 border border-[#e84142]">
          <h3 className="text-md font-semibold text-white mb-2 flex items-center">
            <Award className="w-5 h-5 mr-2 text-[#e84142]" />
            Your Achievements
          </h3>
          <div className="flex flex-wrap gap-2">
            {userBadges.map((badge, index) => (
              <div key={index} className="bg-[#1e293b] px-3 py-1 rounded-full flex items-center shadow-sm border border-[#e84142]">
                {getBadgeIcon(badge)}
                <span className="ml-1 text-sm font-medium text-gray-300">{getBadgeName(badge)}</span>
              </div>
            ))}
          </div>
          {userRank && (
            <div className="mt-2 text-sm text-gray-300">
              Your current rank: <span className="font-bold">#{userRank}</span>
            </div>
          )}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e84142]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e84142]">
            <thead className="bg-[#0f172a]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Player
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Accuracy
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Efficiency
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Innovation
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1e293b] divide-y divide-[#e84142]">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = isWalletConnected && walletAddress && 
                  entry.walletAddress.toLowerCase() === walletAddress.toLowerCase();
                
                return (
                  <tr 
                    key={index} 
                    className={`${index < 3 ? 'bg-[#0f172a]' : ''} ${isCurrentUser ? 'bg-[#172554]' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 ? (
                          <Medal className="w-5 h-5 text-yellow-500 mr-1" />
                        ) : index === 1 ? (
                          <Medal className="w-5 h-5 text-gray-400 mr-1" />
                        ) : index === 2 ? (
                          <Medal className="w-5 h-5 text-amber-700 mr-1" />
                        ) : (
                          <span className="text-gray-300 font-medium">{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-gray-300">{formatAddress(entry.walletAddress)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">{entry.score}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">{entry.accuracy}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">{entry.efficiency}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">{entry.innovation}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;