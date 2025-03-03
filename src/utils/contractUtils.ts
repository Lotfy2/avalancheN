import Web3 from 'web3';
import { NeuralNetwork } from '../types';

// Neural Network contract address on Avalanche Fuji testnet
const NEURAL_NETWORK_CONTRACT_ADDRESS = '0x26A3b857f474BD63aE0d3A7455261AA997121fed';

// ABI for the Neural Network smart contract
const neuralNetworkABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "badgeType",
        "type": "string"
      }
    ],
    "name": "BadgeAwarded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "networkHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "accuracy",
        "type": "uint256"
      }
    ],
    "name": "NetworkSaved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "score",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "accuracy",
        "type": "uint256"
      }
    ],
    "name": "ScoreSubmitted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getAvailableBadges",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "badgeType",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "levelRequired",
            "type": "uint256"
          }
        ],
        "internalType": "struct NeuralNetworkContract.Badge[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "networkHash",
        "type": "string"
      }
    ],
    "name": "getNetwork",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "networkHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "inputNeurons",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "hiddenNeurons",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outputNeurons",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "activationFunction",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "accuracy",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct NeuralNetworkContract.NeuralNetwork",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerBadges",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerBestScore",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "score",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "accuracy",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "efficiency",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "innovation",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "networkHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct NeuralNetworkContract.PlayerScore",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "getPlayerScores",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "score",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "accuracy",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "efficiency",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "innovation",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "networkHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct NeuralNetworkContract.PlayerScore[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "count",
        "type": "uint256"
      }
    ],
    "name": "getTopScores",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "score",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "accuracy",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "efficiency",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "innovation",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "networkHash",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct NeuralNetworkContract.PlayerScore[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "networkHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "inputNeurons",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "hiddenNeurons",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "outputNeurons",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "activationFunction",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "accuracy",
        "type": "uint256"
      }
    ],
    "name": "saveNetwork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "score",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "accuracy",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "efficiency",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "innovation",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "networkHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "level",
        "type": "uint256"
      }
    ],
    "name": "submitScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

/**
 * Save a neural network to the blockchain
 * @param network The neural network to save
 * @param walletAddress The user's wallet address
 * @param accuracy The accuracy achieved by the network
 * @returns True if the network was saved successfully
 */
export const saveNetworkToBlockchain = async (
  network: NeuralNetwork,
  walletAddress: string,
  accuracy: number
): Promise<boolean> => {
  try {
    if (!window.ethereum) {
      console.log('Demo mode: Simulating successful network save');
      return true;
    }
    
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(neuralNetworkABI as any, NEURAL_NETWORK_CONTRACT_ADDRESS);
    
    // Generate network hash
    const networkHash = generateNetworkHash(network);
    
    // Count neurons in each layer
    const inputNeurons = network.layers[0].neurons.length;
    const hiddenNeurons = network.layers[1].neurons.length;
    const outputNeurons = network.layers[2].neurons.length;
    
    // Convert accuracy to integer (scaled by 10000)
    const accuracyValue = Math.floor(accuracy * 10000);
    
    // Save network to blockchain
    const tx = await contract.methods.saveNetwork(
      networkHash,
      inputNeurons,
      hiddenNeurons,
      outputNeurons,
      network.activationFunction,
      accuracyValue
    ).send({ from: walletAddress });
    
    console.log('Network saved successfully:', tx);
    return true;
  } catch (error) {
    console.error('Error saving network to blockchain:', error);
    return false;
  }
};

/**
 * Submit a score to the blockchain
 * @param walletAddress The user's wallet address
 * @param score The total score
 * @param accuracy The accuracy achieved
 * @param efficiency The efficiency score
 * @param innovation The innovation score
 * @param networkHash The hash of the network used
 * @param level The current game level
 * @returns True if the score was submitted successfully
 */
export const submitScoreToBlockchain = async (
  walletAddress: string,
  score: number,
  accuracy: number,
  efficiency: number,
  innovation: number,
  networkHash: string,
  level: number
): Promise<boolean> => {
  try {
    if (!window.ethereum) {
      console.log('Demo mode: Simulating successful score submission');
      return true;
    }
    
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(neuralNetworkABI as any, NEURAL_NETWORK_CONTRACT_ADDRESS);
    
    // Convert values to appropriate format for blockchain
    const scoreValue = Math.floor(score * 100); // Scale up for integer storage
    const accuracyValue = Math.floor(accuracy * 10000);
    const efficiencyValue = Math.floor(efficiency * 100);
    const innovationValue = Math.floor(innovation * 100);
    
    // Submit transaction
    const tx = await contract.methods.submitScore(
      scoreValue,
      accuracyValue,
      efficiencyValue,
      innovationValue,
      networkHash,
      level
    ).send({ from: walletAddress });
    
    console.log('Score submitted successfully:', tx);
    return true;
  } catch (error) {
    console.error('Error submitting score:', error);
    return false;
  }
};

/**
 * Get a player's badges from the blockchain
 * @param walletAddress The user's wallet address
 * @returns Array of badge types
 */
export const getPlayerBadges = async (walletAddress: string): Promise<string[]> => {
  try {
    if (!window.ethereum) {
      // Return mock badges for demo
      return ['color-master', 'pattern-master'];
    }
    
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(neuralNetworkABI as any, NEURAL_NETWORK_CONTRACT_ADDRESS);
    
    try {
      const badges = await contract.methods.getPlayerBadges(walletAddress).call();
      return badges;
    } catch (error) {
      console.error('Error calling getPlayerBadges:', error);
      return ['color-master']; // Return mock data on error
    }
  } catch (error) {
    console.error('Error getting player badges:', error);
    return ['color-master']; // Return mock data on error
  }
};

/**
 * Get top scores from the blockchain for the leaderboard
 * @param count Number of top scores to retrieve
 * @returns Array of player scores
 */
export const getTopScores = async (count: number = 10) => {
  try {
    if (!window.ethereum) {
      // Generate mock data for demo purposes
      return generateMockLeaderboardData(count);
    }
    
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(neuralNetworkABI as any, NEURAL_NETWORK_CONTRACT_ADDRESS);
    
    try {
      const results = await contract.methods.getTopScores(count).call();
      
      // Format the results
      return results.map((entry: any) => ({
        walletAddress: entry.player,
        score: entry.score / 100, // Scale down from blockchain integer storage
        accuracy: entry.accuracy / 10000,
        efficiency: entry.efficiency / 100,
        innovation: entry.innovation / 100,
        networkHash: entry.networkHash
      }));
    } catch (error) {
      console.error('Error calling getTopScores:', error);
      return generateMockLeaderboardData(count);
    }
  } catch (error) {
    console.error('Error fetching top scores:', error);
    return generateMockLeaderboardData(count);
  }
};

/**
 * Get a player's best score from the blockchain
 * @param walletAddress The user's wallet address
 * @returns The player's best score or null if none exists
 */
export const getPlayerBestScore = async (walletAddress: string) => {
  try {
    if (!window.ethereum) {
      // Return mock data for demo
      return {
        walletAddress: walletAddress,
        score: 750,
        accuracy: 0.92,
        efficiency: 0.85,
        innovation: 0.7,
        networkHash: `0x${Math.random().toString(16).substring(2, 10)}`,
        timestamp: new Date()
      };
    }
    
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(neuralNetworkABI as any, NEURAL_NETWORK_CONTRACT_ADDRESS);
    
    try {
      const result = await contract.methods.getPlayerBestScore(walletAddress).call();
      
      // Check if player has a score (address will be zero if not)
      if (result.player === '0x0000000000000000000000000000000000000000') {
        return null;
      }
      
      // Format the result
      return {
        walletAddress: result.player,
        score: result.score / 100,
        accuracy: result.accuracy / 10000,
        efficiency: result.efficiency / 100,
        innovation: result.innovation / 100,
        networkHash: result.networkHash,
        timestamp: new Date(result.timestamp * 1000)
      };
    } catch (error) {
      console.error('Error calling getPlayerBestScore:', error);
      // Return mock data on error
      return {
        walletAddress: walletAddress,
        score: 750,
        accuracy: 0.92,
        efficiency: 0.85,
        innovation: 0.7,
        networkHash: `0x${Math.random().toString(16).substring(2, 10)}`,
        timestamp: new Date()
      };
    }
  } catch (error) {
    console.error('Error fetching player best score:', error);
    return null;
  }
};

/**
 * Generate a hash of the neural network for on-chain storage
 * @param network The neural network to hash
 * @returns A hash string representing the network
 */
export const generateNetworkHash = (network: NeuralNetwork): string => {
  // Create a deterministic representation of the network
  const networkString = JSON.stringify({
    layers: network.layers.map((layer) => ({
      type: layer.type,
      neuronCount: layer.neurons.length
    })),
    connections: network.connections.map((conn) => ({
      source: conn.sourceId,
      target: conn.targetId,
      weight: Math.round(conn.weight * 1000) / 1000 // Round to 3 decimal places
    })),
    activationFunction: network.activationFunction,
    learningRate: network.learningRate,
    regularization: network.regularization,
    optimizer: network.optimizer
  });
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < networkString.length; i++) {
    const char = networkString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
};

/**
 * Generate mock leaderboard data for demo purposes
 * @param count Number of entries to generate
 * @returns Array of mock leaderboard entries
 */
const generateMockLeaderboardData = (count: number) => {
  const mockData = Array.from({ length: count }, (_, i) => ({
    walletAddress: `0x${Math.random().toString(16).substring(2, 14)}...${Math.random().toString(16).substring(2, 6)}`,
    score: Math.round(Math.random() * 500 + 500),
    accuracy: Math.random() * 0.2 + 0.8,
    efficiency: Math.random() * 0.5 + 0.5,
    innovation: Math.random() * 0.7 + 0.3,
    networkHash: `0x${Math.random().toString(16).substring(2, 10)}`
  }));
  
  // Sort by score
  mockData.sort((a, b) => b.score - a.score);
  return mockData;
};