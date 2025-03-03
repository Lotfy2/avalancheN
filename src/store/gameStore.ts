import { create } from 'zustand';
import { GameState, NeuralNetwork, GameLevel } from '../types';
import { puzzleLevels, getNextLevel } from '../data/puzzleLevels';

// Use the first puzzle level as the initial level
const initialLevel = puzzleLevels[0];

const initialState: GameState = {
  currentLevel: initialLevel,
  playerNetwork: null,
  trainingProgress: 0,
  accuracy: 0,
  loss: 0,
  executionTime: 0,
  score: 0,
  isTraining: false,
  isWalletConnected: false,
  walletAddress: null
};

export const useGameStore = create<
  GameState & {
    setNetwork: (network: NeuralNetwork) => void;
    startTraining: () => void;
    stopTraining: () => void;
    updateTrainingMetrics: (accuracy: number, loss: number, executionTime: number) => void;
    connectWallet: (address: string) => void;
    disconnectWallet: () => void;
    advanceToNextLevel: () => void;
    resetGame: () => void;
  }
>((set) => ({
  ...initialState,
  
  setNetwork: (network) => set({ playerNetwork: network }),
  
  startTraining: () => set({ isTraining: true, trainingProgress: 0 }),
  
  stopTraining: () => set({ isTraining: false }),
  
  updateTrainingMetrics: (accuracy, loss, executionTime) => 
    set((state) => {
      // Calculate score based on accuracy, execution time, and network complexity
      const networkSize = state.playerNetwork?.layers.reduce(
        (sum, layer) => sum + layer.neurons.length, 0
      ) || 0;
      
      const efficiencyBonus = state.currentLevel.maxNeurons - networkSize;
      const accuracyScore = accuracy * 100;
      const timeBonus = Math.max(0, 10 - executionTime) * 5;
      
      // Add level-specific bonus points
      const levelBonus = state.currentLevel.id * 50;
      
      const score = accuracyScore + efficiencyBonus * 5 + timeBonus + levelBonus;
      
      return { 
        accuracy, 
        loss, 
        executionTime,
        trainingProgress: Math.min(state.trainingProgress + 0.1, 1),
        score: Math.round(score)
      };
    }),
  
  connectWallet: (address) => set({ 
    isWalletConnected: true, 
    walletAddress: address 
  }),
  
  disconnectWallet: () => set({ 
    isWalletConnected: false, 
    walletAddress: null 
  }),
  
  advanceToNextLevel: () => set((state) => {
    const nextLevel = getNextLevel(state.currentLevel.id);
    
    if (!nextLevel) {
      return state; // No more levels
    }
    
    return {
      currentLevel: nextLevel,
      playerNetwork: null,
      trainingProgress: 0,
      accuracy: 0,
      loss: 0,
      executionTime: 0,
      score: state.score // Preserve the score from previous levels
    };
  }),
  
  resetGame: () => set(initialState)
}));