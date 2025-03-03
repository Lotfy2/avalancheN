export interface Neuron {
  id: string;
  type: 'input' | 'hidden' | 'output';
  position: { x: number; y: number; z: number };
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number;
}

export interface Layer {
  id: string;
  type: 'input' | 'hidden' | 'output';
  neurons: Neuron[];
}

export interface NeuralNetwork {
  id: string;
  layers: Layer[];
  connections: Connection[];
  activationFunction: ActivationFunction;
  learningRate: number;
  regularization: RegularizationTechnique;
  optimizer: Optimizer;
}

export type ActivationFunction = 'relu' | 'sigmoid' | 'tanh';
export type RegularizationTechnique = 'none' | 'dropout' | 'l2';
export type Optimizer = 'sgd' | 'adam' | 'rmsprop';

export interface GameLevel {
  id: number;
  name: string;
  description: string;
  difficulty: 'basic' | 'advanced';
  dataset: string;
  targetAccuracy: number;
  maxNeurons: number;
}

export interface PuzzleLevel extends GameLevel {
  inputDescription: string;
  outputDescription: string;
  hints: string[];
  constraints: {
    minInputNeurons?: number;
    maxInputNeurons?: number;
    minOutputNeurons?: number;
    maxOutputNeurons?: number;
    maxHiddenNeurons?: number;
  };
  reward: {
    points: number;
    badge: string;
  };
}

export interface GameState {
  currentLevel: GameLevel;
  playerNetwork: NeuralNetwork | null;
  trainingProgress: number;
  accuracy: number;
  loss: number;
  executionTime: number;
  score: number;
  isTraining: boolean;
  isWalletConnected: boolean;
  walletAddress: string | null;
}

export interface LeaderboardEntry {
  walletAddress: string;
  score: number;
  accuracy: number;
  efficiency: number;
  innovation: number;
  networkHash: string;
}