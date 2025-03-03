import { PuzzleLevel } from '../types';

export const puzzleLevels: PuzzleLevel[] = [
  {
    id: 1,
    name: "RGB Color Classifier",
    description: "Build a neural network that can classify colors based on their RGB values. The network should determine if a color is predominantly 'warm' (more red) or 'cool' (more blue/green).",
    difficulty: "basic",
    dataset: "rgb-classification",
    targetAccuracy: 0.85,
    maxNeurons: 10,
    inputDescription: "3 input neurons representing R, G, B values (0-1)",
    outputDescription: "2 output neurons: [warm, cool]",
    hints: [
      "Start with 5-7 neurons in your hidden layer",
      "ReLU activation often works well for this type of classification",
      "The rule is simple: if R > (G+B)/2 then it's warm, otherwise cool"
    ],
    constraints: {
      minInputNeurons: 3,
      maxInputNeurons: 3,
      minOutputNeurons: 2,
      maxOutputNeurons: 2
    },
    reward: {
      points: 100,
      badge: "color-master"
    }
  },
  {
    id: 2,
    name: "Pattern Recognition Challenge",
    description: "Create an optimized neural network that can identify complex patterns in multi-dimensional data. This level tests your ability to fine-tune hyperparameters for maximum accuracy.",
    difficulty: "advanced",
    dataset: "complex-classification",
    targetAccuracy: 0.92,
    maxNeurons: 15,
    inputDescription: "4 input neurons representing x₁, x₂, x₃, x₄ values (-1 to 1)",
    outputDescription: "2 output neurons: [pattern A, pattern B]",
    hints: [
      "Try different activation functions - tanh might perform better than ReLU here",
      "Experiment with regularization to prevent overfitting",
      "Adam optimizer often converges faster than SGD for complex patterns",
      "The underlying pattern involves trigonometric relationships between inputs"
    ],
    constraints: {
      minInputNeurons: 4,
      maxInputNeurons: 4,
      minOutputNeurons: 2,
      maxOutputNeurons: 2
    },
    reward: {
      points: 250,
      badge: "pattern-master"
    }
  },
  {
    id: 3,
    name: "Efficiency Challenge",
    description: "Design the smallest possible neural network that still achieves at least 90% accuracy on the RGB classification task. This level tests your ability to create efficient architectures.",
    difficulty: "advanced",
    dataset: "rgb-classification",
    targetAccuracy: 0.90,
    maxNeurons: 5,
    inputDescription: "3 input neurons representing R, G, B values (0-1)",
    outputDescription: "2 output neurons: [warm, cool]",
    hints: [
      "Focus on the most essential connections",
      "A well-designed small network can outperform a poorly designed large one",
      "Consider which activation function might be most efficient for this task"
    ],
    constraints: {
      minInputNeurons: 3,
      maxInputNeurons: 3,
      minOutputNeurons: 2,
      maxOutputNeurons: 2,
      maxHiddenNeurons: 5
    },
    reward: {
      points: 300,
      badge: "efficiency-expert"
    }
  }
];

export const getNextLevel = (currentLevelId: number): PuzzleLevel | null => {
  const nextLevelIndex = puzzleLevels.findIndex(level => level.id === currentLevelId) + 1;
  return nextLevelIndex < puzzleLevels.length ? puzzleLevels[nextLevelIndex] : null;
};

export const getLevelById = (levelId: number): PuzzleLevel | undefined => {
  return puzzleLevels.find(level => level.id === levelId);
};