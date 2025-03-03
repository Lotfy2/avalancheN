import { NeuralNetwork, ActivationFunction } from '../types';

// Actual dataset for training
const generateDataset = (datasetType: string, size: number = 100) => {
  if (datasetType === 'rgb-classification') {
    return Array.from({ length: size }, () => {
      const r = Math.random();
      const g = Math.random();
      const b = Math.random();
      // Rule: if r > (g + b)/2 then class 1, else class 0
      const label = r > (g + b) / 2 ? 1 : 0;
      return { input: [r, g, b], output: [label, 1 - label] };
    });
  } else if (datasetType === 'complex-classification') {
    return Array.from({ length: size }, () => {
      const x1 = Math.random() * 2 - 1;
      const x2 = Math.random() * 2 - 1;
      const x3 = Math.random() * 2 - 1;
      const x4 = Math.random() * 2 - 1;
      // More complex rule: if sin(x1*x2) + cos(x3*x4) > 0 then class 1, else class 0
      const label = Math.sin(x1 * x2) + Math.cos(x3 * x4) > 0 ? 1 : 0;
      return { input: [x1, x2, x3, x4], output: [label, 1 - label] };
    });
  }
  
  return [];
};

// Activation functions
const activationFunctions = {
  relu: (x: number) => Math.max(0, x),
  sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
  tanh: (x: number) => Math.tanh(x)
};

// Activation function derivatives for backpropagation
const activationDerivatives = {
  relu: (x: number) => x > 0 ? 1 : 0,
  sigmoid: (x: number) => {
    const sigX = 1 / (1 + Math.exp(-x));
    return sigX * (1 - sigX);
  },
  tanh: (x: number) => 1 - Math.pow(Math.tanh(x), 2)
};

// Forward pass implementation
const forwardPass = (
  network: NeuralNetwork, 
  input: number[]
) => {
  const activation = activationFunctions[network.activationFunction];
  
  // Map input values to input layer neurons
  const inputLayer = network.layers.find(l => l.type === 'input');
  const hiddenLayers = network.layers.filter(l => l.type === 'hidden');
  const outputLayer = network.layers.find(l => l.type === 'output');
  
  if (!inputLayer || !outputLayer) return { output: [], layerOutputs: [], layerInputs: [] };
  
  // Store all layer outputs and inputs for backpropagation
  const layerOutputs: number[][] = [];
  const layerInputs: number[][] = [];
  
  // Process through all layers
  let currentValues = input;
  layerOutputs.push([...currentValues]); // Input layer output
  
  for (const layer of [...hiddenLayers, outputLayer]) {
    const nextValues: number[] = [];
    const layerInputsArray: number[] = [];
    
    // For each neuron in this layer
    for (let i = 0; i < layer.neurons.length; i++) {
      const neuron = layer.neurons[i];
      
      // Find all connections to this neuron
      const incomingConnections = network.connections.filter(
        conn => conn.targetId === neuron.id
      );
      
      // Compute weighted sum
      let sum = 0;
      for (const conn of incomingConnections) {
        const sourceNeuron = network.layers
          .flatMap(l => l.neurons)
          .find(n => n.id === conn.sourceId);
          
        if (sourceNeuron) {
          const sourceLayerIndex = network.layers.findIndex(l => 
            l.neurons.some(n => n.id === conn.sourceId)
          );
          
          const sourceNeuronIndex = network.layers[sourceLayerIndex].neurons
            .findIndex(n => n.id === conn.sourceId);
          
          if (layerOutputs[sourceLayerIndex] && layerOutputs[sourceLayerIndex][sourceNeuronIndex] !== undefined) {
            sum += layerOutputs[sourceLayerIndex][sourceNeuronIndex] * conn.weight;
          }
        }
      }
      
      layerInputsArray.push(sum); // Store pre-activation input
      nextValues.push(activation(sum)); // Apply activation function
    }
    
    layerInputs.push(layerInputsArray);
    layerOutputs.push(nextValues);
  }
  
  return {
    output: layerOutputs[layerOutputs.length - 1],
    layerOutputs,
    layerInputs
  };
};

// Calculate loss (mean squared error)
const calculateLoss = (predicted: number[], actual: number[]) => {
  return predicted.reduce((sum, pred, i) => {
    const diff = pred - (actual[i] || 0);
    return sum + diff * diff;
  }, 0) / predicted.length;
};

// Backpropagation implementation
const backpropagate = (
  network: NeuralNetwork,
  input: number[],
  target: number[],
  learningRate: number
) => {
  // Forward pass to get all layer outputs
  const { output, layerOutputs, layerInputs } = forwardPass(network, input);
  
  // Calculate output layer error
  const outputLayerIndex = network.layers.length - 1;
  const outputErrors = output.map((out, i) => out - target[i]);
  
  // Initialize gradients for all layers
  const gradients: number[][] = Array(network.layers.length).fill(0).map(() => []);
  
  // Calculate gradients for output layer
  const outputLayer = network.layers[outputLayerIndex];
  const outputLayerInputs = layerInputs[layerInputs.length - 1];
  
  for (let i = 0; i < outputLayer.neurons.length; i++) {
    const error = outputErrors[i];
    const input = outputLayerInputs[i];
    const derivative = activationDerivatives[network.activationFunction](input);
    gradients[outputLayerIndex][i] = error * derivative;
  }
  
  // Backpropagate error through hidden layers
  for (let layerIndex = outputLayerIndex - 1; layerIndex > 0; layerIndex--) {
    const currentLayer = network.layers[layerIndex];
    const nextLayer = network.layers[layerIndex + 1];
    
    for (let i = 0; i < currentLayer.neurons.length; i++) {
      let error = 0;
      
      // Sum up all the errors from the next layer
      for (let j = 0; j < nextLayer.neurons.length; j++) {
        const connection = network.connections.find(
          conn => conn.sourceId === currentLayer.neurons[i].id && 
                 conn.targetId === nextLayer.neurons[j].id
        );
        
        if (connection) {
          error += gradients[layerIndex + 1][j] * connection.weight;
        }
      }
      
      const input = layerInputs[layerIndex - 1][i];
      const derivative = activationDerivatives[network.activationFunction](input);
      gradients[layerIndex][i] = error * derivative;
    }
  }
  
  // Update weights
  for (let i = 0; i < network.connections.length; i++) {
    const connection = network.connections[i];
    const sourceNeuron = network.layers
      .flatMap(l => l.neurons)
      .find(n => n.id === connection.sourceId);
      
    const targetNeuron = network.layers
      .flatMap(l => l.neurons)
      .find(n => n.id === connection.targetId);
      
    if (sourceNeuron && targetNeuron) {
      const sourceLayerIndex = network.layers.findIndex(l => 
        l.neurons.some(n => n.id === connection.sourceId)
      );
      
      const targetLayerIndex = network.layers.findIndex(l => 
        l.neurons.some(n => n.id === connection.targetId)
      );
      
      const sourceNeuronIndex = network.layers[sourceLayerIndex].neurons
        .findIndex(n => n.id === connection.sourceId);
        
      const targetNeuronIndex = network.layers[targetLayerIndex].neurons
        .findIndex(n => n.id === connection.targetId);
      
      const sourceOutput = layerOutputs[sourceLayerIndex][sourceNeuronIndex];
      const targetGradient = gradients[targetLayerIndex][targetNeuronIndex];
      
      // Apply regularization if needed
      let regularizationTerm = 0;
      if (network.regularization === 'l2') {
        regularizationTerm = 0.0001 * connection.weight;
      }
      
      // Update weight based on optimizer
      let weightUpdate = learningRate * targetGradient * sourceOutput;
      
      // Apply different optimizers
      if (network.optimizer === 'adam') {
        // Simplified Adam implementation
        weightUpdate *= 1.1; // Boost learning for Adam
      } else if (network.optimizer === 'rmsprop') {
        // Simplified RMSprop implementation
        weightUpdate *= 1.05; // Boost learning for RMSprop
      }
      
      // Apply dropout if enabled
      if (network.regularization === 'dropout' && Math.random() > 0.5) {
        weightUpdate = 0;
      }
      
      connection.weight -= weightUpdate + regularizationTerm;
    }
  }
  
  return calculateLoss(output, target);
};

// Simulate training for a number of epochs
export const simulateTraining = async (
  network: NeuralNetwork,
  datasetType: string,
  epochs: number = 10,
  batchSize: number = 10,
  callback: (epoch: number, accuracy: number, loss: number) => void
): Promise<{
  finalAccuracy: number;
  finalLoss: number;
  executionTime: number;
}> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const dataset = generateDataset(datasetType, 100);
    const testSet = generateDataset(datasetType, 20); // Separate test set
    
    // Clone the network to avoid modifying the original
    const trainingNetwork = JSON.parse(JSON.stringify(network));
    
    // Simulate training epochs
    let currentEpoch = 0;
    
    const runEpoch = () => {
      if (currentEpoch >= epochs) {
        // Final evaluation on test set
        let correctPredictions = 0;
        let finalLoss = 0;
        
        for (const sample of testSet) {
          const { output } = forwardPass(trainingNetwork, sample.input);
          finalLoss += calculateLoss(output, sample.output);
          
          // Check if prediction is correct
          const predictedClass = output.indexOf(Math.max(...output));
          const actualClass = sample.output.indexOf(Math.max(...sample.output));
          if (predictedClass === actualClass) {
            correctPredictions++;
          }
        }
        
        const finalAccuracy = correctPredictions / testSet.length;
        const endTime = performance.now();
        const executionTime = (endTime - startTime) / 1000; // in seconds
        
        // Update the original network with trained weights
        for (let i = 0; i < network.connections.length; i++) {
          network.connections[i].weight = trainingNetwork.connections[i].weight;
        }
        
        resolve({
          finalAccuracy,
          finalLoss: finalLoss / testSet.length,
          executionTime
        });
        
        return;
      }
      
      let totalLoss = 0;
      
      // Process in batches
      for (let i = 0; i < dataset.length; i += batchSize) {
        const batch = dataset.slice(i, i + batchSize);
        
        for (const sample of batch) {
          // Perform backpropagation
          const loss = backpropagate(
            trainingNetwork,
            sample.input,
            sample.output,
            trainingNetwork.learningRate
          );
          
          totalLoss += loss;
        }
      }
      
      // Calculate accuracy on test set
      let correctPredictions = 0;
      for (const sample of testSet) {
        const { output } = forwardPass(trainingNetwork, sample.input);
        
        // Check if prediction is correct (for classification)
        const predictedClass = output.indexOf(Math.max(...output));
        const actualClass = sample.output.indexOf(Math.max(...sample.output));
        if (predictedClass === actualClass) {
          correctPredictions++;
        }
      }
      
      const accuracy = correctPredictions / testSet.length;
      const averageLoss = totalLoss / dataset.length;
      
      // Report progress
      callback(currentEpoch, accuracy, averageLoss);
      
      currentEpoch++;
      setTimeout(runEpoch, 0); // Use setTimeout to avoid blocking the UI
    };
    
    runEpoch();
  });
};

// Generate a random neural network for testing
export const generateRandomNetwork = (
  inputSize: number,
  hiddenSize: number,
  outputSize: number
): NeuralNetwork => {
  // Create layers
  const inputLayer: Layer = {
    id: 'input-layer',
    type: 'input',
    neurons: Array.from({ length: inputSize }, (_, i) => ({
      id: `input-${i}`,
      type: 'input',
      position: { x: 0, y: i - inputSize / 2, z: 0 }
    }))
  };
  
  const hiddenLayer: Layer = {
    id: 'hidden-layer',
    type: 'hidden',
    neurons: Array.from({ length: hiddenSize }, (_, i) => ({
      id: `hidden-${i}`,
      type: 'hidden',
      position: { x: 1, y: i - hiddenSize / 2, z: 0 }
    }))
  };
  
  const outputLayer: Layer = {
    id: 'output-layer',
    type: 'output',
    neurons: Array.from({ length: outputSize }, (_, i) => ({
      id: `output-${i}`,
      type: 'output',
      position: { x: 2, y: i - outputSize / 2, z: 0 }
    }))
  };
  
  // Create connections
  const connections: Connection[] = [];
  
  // Connect input to hidden
  for (const inputNeuron of inputLayer.neurons) {
    for (const hiddenNeuron of hiddenLayer.neurons) {
      connections.push({
        id: `${inputNeuron.id}-${hiddenNeuron.id}`,
        sourceId: inputNeuron.id,
        targetId: hiddenNeuron.id,
        weight: Math.random() * 2 - 1 // Random weight between -1 and 1
      });
    }
  }
  
  // Connect hidden to output
  for (const hiddenNeuron of hiddenLayer.neurons) {
    for (const outputNeuron of outputLayer.neurons) {
      connections.push({
        id: `${hiddenNeuron.id}-${outputNeuron.id}`,
        sourceId: hiddenNeuron.id,
        targetId: outputNeuron.id,
        weight: Math.random() * 2 - 1
      });
    }
  }
  
  return {
    id: 'random-network',
    layers: [inputLayer, hiddenLayer, outputLayer],
    connections,
    activationFunction: 'relu',
    learningRate: 0.01,
    regularization: 'none',
    optimizer: 'sgd'
  };
};

// Helper types for the simulator
interface Layer {
  id: string;
  type: 'input' | 'hidden' | 'output';
  neurons: {
    id: string;
    type: 'input' | 'hidden' | 'output';
    position: { x: number; y: number; z: number };
  }[];
}

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  weight: number;
}

// Generate a sample dataset for visualization
export const generateSampleDataset = (datasetType: string, count: number = 10) => {
  const samples = generateDataset(datasetType, count);
  
  if (datasetType === 'rgb-classification') {
    // Add color representation for visualization
    return samples.map(sample => {
      const [r, g, b] = sample.input;
      const colorHex = rgbToHex(r, g, b);
      const isWarm = sample.output[0] > sample.output[1];
      
      return {
        ...sample,
        color: colorHex,
        label: isWarm ? 'Warm' : 'Cool'
      };
    });
  }
  
  return samples;
};

// Helper function to convert RGB values to hex color
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};