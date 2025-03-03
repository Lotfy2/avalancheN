import Web3 from 'web3';
import { generateNetworkHash, submitScoreToBlockchain, getPlayerBadges as fetchPlayerBadges, getTopScores as fetchTopScores, getPlayerBestScore as fetchPlayerBestScore, saveNetworkToBlockchain } from './contractUtils';
import { NeuralNetwork } from '../types';
import { useGameStore } from '../store/gameStore';

// Connect to wallet using MetaMask or other providers
export const connectWallet = async (): Promise<string | null> => {
  try {
    // Check if Web3 is injected by MetaMask or similar
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        // Check if connected to Avalanche network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        // Avalanche Fuji Testnet Chain ID: 0xa869 (43113)
        if (chainId !== '0xa869') {
          try {
            // Try to switch to Avalanche Fuji Testnet
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xa869' }],
            });
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xa869',
                    chainName: 'Avalanche Fuji Testnet',
                    nativeCurrency: {
                      name: 'AVAX',
                      symbol: 'AVAX',
                      decimals: 18
                    },
                    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                    blockExplorerUrls: ['https://testnet.snowtrace.io/']
                  },
                ],
              });
            } else {
              console.error('Failed to switch network:', switchError);
              return null;
            }
          }
        }
        
        return accounts[0];
      }
    } else {
      console.error('No Ethereum provider detected. Please install MetaMask.');
    }
    return null;
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    return null;
  }
};

// Submit score to the leaderboard
export const submitScore = async (
  walletAddress: string,
  score: number,
  accuracy: number,
  efficiency: number,
  innovation: number,
  networkHash: string
): Promise<boolean> => {
  try {
    // Get current level from game state
    const { currentLevel } = useGameStore.getState();
    
    // Submit score to blockchain
    return await submitScoreToBlockchain(
      walletAddress,
      score,
      accuracy,
      efficiency,
      innovation,
      networkHash,
      currentLevel.id
    );
  } catch (error) {
    console.error('Error submitting score:', error);
    return false;
  }
};

// Save neural network to blockchain
export const saveNetwork = async (
  network: NeuralNetwork,
  walletAddress: string,
  accuracy: number
): Promise<boolean> => {
  try {
    return await saveNetworkToBlockchain(network, walletAddress, accuracy);
  } catch (error) {
    console.error('Error saving network:', error);
    return false;
  }
};

// Get top scores from the leaderboard
export const getLeaderboard = async () => {
  return await fetchTopScores(20);
};

// Get player's score from the leaderboard
export const getPlayerScore = async (walletAddress: string) => {
  return await fetchPlayerBestScore(walletAddress);
};

// Check if user has an NFT badge
export const checkUserBadges = async (walletAddress: string): Promise<string[]> => {
  return await fetchPlayerBadges(walletAddress);
};

// Re-export the generateNetworkHash function from contractUtils
export { generateNetworkHash };

// Add type definitions for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}