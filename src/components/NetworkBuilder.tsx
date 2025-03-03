import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { NeuralNetwork, Layer, Neuron, Connection, ActivationFunction, RegularizationTechnique, Optimizer, PuzzleLevel } from '../types';
import { Brain, Zap, Settings, Save, Upload, Download, AlertTriangle, Snowflake, Info } from 'lucide-react';

const NetworkBuilder: React.FC = () => {
  const { currentLevel, playerNetwork, setNetwork } = useGameStore();
  
  // Check if the current level has puzzle-specific constraints
  const isPuzzleLevel = 'constraints' in currentLevel;
  const puzzleLevel = currentLevel as PuzzleLevel;
  
  // Set default values based on level constraints if available
  const defaultInputNeurons = isPuzzleLevel && puzzleLevel.constraints.minInputNeurons 
    ? puzzleLevel.constraints.minInputNeurons 
    : 3;
    
  const defaultOutputNeurons = isPuzzleLevel && puzzleLevel.constraints.minOutputNeurons 
    ? puzzleLevel.constraints.minOutputNeurons 
    : 2;
  
  const [inputNeurons, setInputNeurons] = useState(defaultInputNeurons);
  const [hiddenNeurons, setHiddenNeurons] = useState(5);
  const [outputNeurons, setOutputNeurons] = useState(defaultOutputNeurons);
  const [activationFunction, setActivationFunction] = useState<ActivationFunction>('relu');
  const [learningRate, setLearningRate] = useState(0.01);
  const [regularization, setRegularization] = useState<RegularizationTechnique>('none');
  const [optimizer, setOptimizer] = useState<Optimizer>('sgd');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showInputInfo, setShowInputInfo] = useState(false);
  const [showOutputInfo, setShowOutputInfo] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Update advanced options visibility based on level
  useEffect(() => {
    if (currentLevel.difficulty === 'advanced') {
      setShowAdvancedOptions(true);
    }
    
    // Apply level constraints if available
    if (isPuzzleLevel) {
      if (puzzleLevel.constraints.minInputNeurons) {
        setInputNeurons(puzzleLevel.constraints.minInputNeurons);
      }
      
      if (puzzleLevel.constraints.minOutputNeurons) {
        setOutputNeurons(puzzleLevel.constraints.minOutputNeurons);
      }
      
      // If max hidden neurons is specified, ensure we don't exceed it
      if (puzzleLevel.constraints.maxHiddenNeurons && hiddenNeurons > puzzleLevel.constraints.maxHiddenNeurons) {
        setHiddenNeurons(puzzleLevel.constraints.maxHiddenNeurons);
      }
    }
  }, [currentLevel]);
  
  // Validate network against level constraints
  const validateNetwork = () => {
    if (!isPuzzleLevel) return true;
    
    const constraints = puzzleLevel.constraints;
    
    if (constraints.minInputNeurons && inputNeurons < constraints.minInputNeurons) {
      setValidationError(`This level requires at least ${constraints.minInputNeurons} input neurons`);
      return false;
    }
    
    if (constraints.maxInputNeurons && inputNeurons > constraints.maxInputNeurons) {
      setValidationError(`This level allows at most ${constraints.maxInputNeurons} input neurons`);
      return false;
    }
    
    if (constraints.minOutputNeurons && outputNeurons < constraints.minOutputNeurons) {
      setValidationError(`This level requires at least ${constraints.minOutputNeurons} output neurons`);
      return false;
    }
    
    if (constraints.maxOutputNeurons && outputNeurons > constraints.maxOutputNeurons) {
      setValidationError(`This level allows at most ${constraints.maxOutputNeurons} output neurons`);
      return false;
    }
    
    if (constraints.maxHiddenNeurons && hiddenNeurons > constraints.maxHiddenNeurons) {
      setValidationError(`This level allows at most ${constraints.maxHiddenNeurons} hidden neurons`);
      return false;
    }
    
    setValidationError(null);
    return true;
  };
  
  // Generate a neural network based on current settings
  const generateNetwork = () => {
    // Validate against level constraints
    if (!validateNetwork()) return;
    
    // Create layers
    const inputLayer: Layer = {
      id: 'input-layer',
      type: 'input',
      neurons: Array.from({ length: inputNeurons }, (_, i) => ({
        id: `input-${i}`,
        type: 'input',
        position: { x: 0, y: i - inputNeurons / 2, z: 0 }
      }))
    };
    
    const hiddenLayer: Layer = {
      id: 'hidden-layer',
      type: 'hidden',
      neurons: Array.from({ length: hiddenNeurons }, (_, i) => ({
        id: `hidden-${i}`,
        type: 'hidden',
        position: { x: 1, y: i - hiddenNeurons / 2, z: 0 }
      }))
    };
    
    const outputLayer: Layer = {
      id: 'output-layer',
      type: 'output',
      neurons: Array.from({ length: outputNeurons }, (_, i) => ({
        id: `output-${i}`,
        type: 'output',
        position: { x: 2, y: i - outputNeurons / 2, z: 0 }
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
    
    const network: NeuralNetwork = {
      id: 'player-network',
      layers: [inputLayer, hiddenLayer, outputLayer],
      connections,
      activationFunction,
      learningRate,
      regularization,
      optimizer
    };
    
    setNetwork(network);
  };
  
  // Save network to JSON file
  const saveNetwork = () => {
    if (!playerNetwork) return;
    
    const networkJson = JSON.stringify(playerNetwork, null, 2);
    const blob = new Blob([networkJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `neural-network-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Load network from JSON file
  const loadNetwork = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const network = JSON.parse(e.target?.result as string) as NeuralNetwork;
        
        // Validate the loaded network against level constraints
        if (isPuzzleLevel) {
          const constraints = puzzleLevel.constraints;
          
          if (constraints.minInputNeurons && network.layers[0].neurons.length < constraints.minInputNeurons) {
            setValidationError(`This level requires at least ${constraints.minInputNeurons} input neurons`);
            return;
          }
          
          if (constraints.maxInputNeurons && network.layers[0].neurons.length > constraints.maxInputNeurons) {
            setValidationError(`This level allows at most ${constraints.maxInputNeurons} input neurons`);
            return;
          }
          
          if (constraints.minOutputNeurons && network.layers[2].neurons.length < constraints.minOutputNeurons) {
            setValidationError(`This level requires at least ${constraints.minOutputNeurons} output neurons`);
            return;
          }
          
          if (constraints.maxOutputNeurons && network.layers[2].neurons.length > constraints.maxOutputNeurons) {
            setValidationError(`This level allows at most ${constraints.maxOutputNeurons} output neurons`);
            return;
          }
          
          if (constraints.maxHiddenNeurons && network.layers[1].neurons.length > constraints.maxHiddenNeurons) {
            setValidationError(`This level allows at most ${constraints.maxHiddenNeurons} hidden neurons`);
            return;
          }
        }
        
        setNetwork(network);
        
        // Update UI controls to match loaded network
        setInputNeurons(network.layers[0].neurons.length);
        setHiddenNeurons(network.layers[1].neurons.length);
        setOutputNeurons(network.layers[2].neurons.length);
        setActivationFunction(network.activationFunction);
        setLearningRate(network.learningRate);
        setRegularization(network.regularization);
        setOptimizer(network.optimizer);
        setValidationError(null);
      } catch (error) {
        console.error('Error loading network:', error);
        setValidationError('Invalid network file format');
      }
    };
    reader.readAsText(file);
  };
  
  // Trigger file input click
  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="bg-[#1e293b] rounded-lg shadow-lg p-6 mb-6 border border-[#e84142]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Snowflake className="w-6 h-6 mr-2 text-[#e84142]" />
          <h2 className="text-xl font-bold text-white">Neural Network Builder</h2>
        </div>
        
        {playerNetwork && (
          <div className="flex space-x-2">
            <button
              onClick={saveNetwork}
              className="bg-[#334155] text-white py-1 px-3 rounded-md text-sm flex items-center hover:bg-[#475569] transition-colors"
              title="Save network as JSON"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </button>
            <button
              onClick={handleLoadClick}
              className="bg-[#334155] text-white py-1 px-3 rounded-md text-sm flex items-center hover:bg-[#475569] transition-colors"
              title="Load network from JSON"
            >
              <Upload className="w-4 h-4 mr-1" />
              Load
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={loadNetwork}
              className="hidden"
            />
          </div>
        )}
      </div>
      
      {validationError && (
        <div className="mb-4 bg-[#450a0a] border border-[#b91c1c] text-white px-4 py-3 rounded-md flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-[#e84142]" />
          <span>{validationError}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">Layer Configuration</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-sm font-medium text-gray-300">
                    Input Neurons {isPuzzleLevel && puzzleLevel.constraints.minInputNeurons && `(Fixed: ${puzzleLevel.constraints.minInputNeurons})`}
                  </label>
                  <button 
                    onClick={() => setShowInputInfo(!showInputInfo)}
                    className="ml-2 text-[#e84142] hover:text-[#c5383a]"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                
                {showInputInfo && (
                  <div className="mb-2 p-2 bg-[#0f172a] rounded-md border border-[#2d3748] text-xs text-gray-300">
                    {currentLevel.dataset === 'rgb-classification' ? (
                      <p>For RGB classification, the 3 input neurons represent Red, Green, and Blue color values (0-1).</p>
                    ) : (
                      <p>Input neurons receive the initial data that will be processed by the network.</p>
                    )}
                    {isPuzzleLevel && puzzleLevel.constraints.minInputNeurons === puzzleLevel.constraints.maxInputNeurons && (
                      <p className="mt-1 text-[#e84142]">This level requires exactly {puzzleLevel.constraints.minInputNeurons} input neurons.</p>
                    )}
                  </div>
                )}
                
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={inputNeurons}
                  onChange={(e) => setInputNeurons(parseInt(e.target.value))}
                  className="w-full accent-[#e84142]"
                  disabled={isPuzzleLevel && puzzleLevel.constraints.minInputNeurons === puzzleLevel.constraints.maxInputNeurons}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1</span>
                  <span>{inputNeurons}</span>
                  <span>10</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Hidden Neurons {isPuzzleLevel && puzzleLevel.constraints.maxHiddenNeurons && `(Max: ${puzzleLevel.constraints.maxHiddenNeurons})`}
                </label>
                <input
                  type="range"
                  min="1"
                  max={isPuzzleLevel && puzzleLevel.constraints.maxHiddenNeurons ? puzzleLevel.constraints.maxHiddenNeurons : currentLevel.maxNeurons}
                  value={hiddenNeurons}
                  onChange={(e) => setHiddenNeurons(parseInt(e.target.value))}
                  className="w-full accent-[#e84142]"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1</span>
                  <span>{hiddenNeurons}</span>
                  <span>{isPuzzleLevel && puzzleLevel.constraints.maxHiddenNeurons ? puzzleLevel.constraints.maxHiddenNeurons : currentLevel.maxNeurons}</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-sm font-medium text-gray-300">
                    Output Neurons {isPuzzleLevel && puzzleLevel.constraints.minOutputNeurons && `(Fixed: ${puzzleLevel.constraints.minOutputNeurons})`}
                  </label>
                  <button 
                    onClick={() => setShowOutputInfo(!showOutputInfo)}
                    className="ml-2 text-[#e84142] hover:text-[#c5383a]"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                
                {showOutputInfo && (
                  <div className="mb-2 p-2 bg-[#0f172a] rounded-md border border-[#2d3748] text-xs text-gray-300">
                    {currentLevel.dataset === 'rgb-classification' ? (
                      <p>For RGB classification, the 2 output neurons represent "warm" and "cool" color classifications.</p>
                    ) : (
                      <p>Output neurons provide the final result after processing the input data.</p>
                    )}
                    {isPuzzleLevel && puzzleLevel.constraints.minOutputNeurons === puzzleLevel.constraints.maxOutputNeurons && (
                      <p className="mt-1 text-[#e84142]">This level requires exactly {puzzleLevel.constraints.minOutputNeurons} output neurons.</p>
                    )}
                  </div>
                )}
                
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={outputNeurons}
                  onChange={(e) => setOutputNeurons(parseInt(e.target.value))}
                  className="w-full accent-[#e84142]"
                  disabled={isPuzzleLevel && puzzleLevel.constraints.minOutputNeurons === puzzleLevel.constraints.maxOutputNeurons}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1</span>
                  <span>{outputNeurons}</span>
                  <span>5</span>
                </div>
              </div>
            </div>
          </div>
          
          {currentLevel.difficulty === 'basic' && (
            <div>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-[#e84142] hover:text-[#c5383a] text-sm font-medium flex items-center"
              >
                <Settings className="w-4 h-4 mr-1" />
                {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
              </button>
            </div>
          )}
          
          {(currentLevel.difficulty === 'advanced' || showAdvancedOptions) && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center text-white">
                <Settings className="w-5 h-5 mr-1 text-[#e84142]" />
                Advanced Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Activation Function
                  </label>
                  <select
                    value={activationFunction}
                    onChange={(e) => setActivationFunction(e.target.value as ActivationFunction)}
                    className="block w-full rounded-md border-[#e84142] bg-[#0f172a] shadow-sm focus:border-[#e84142] focus:ring-[#e84142] text-white sm:text-sm"
                  >
                    <option value="relu">ReLU</option>
                    <option value="sigmoid">Sigmoid</option>
                    <option value="tanh">Tanh</option>
                  </select>
                  <div className="mt-1 text-xs text-gray-400">
                    {activationFunction === 'relu' && 'ReLU: Fast and effective for hidden layers, but can cause "dying neurons"'}
                    {activationFunction === 'sigmoid' && 'Sigmoid: Maps values between 0 and 1, good for output layers in binary classification'}
                    {activationFunction === 'tanh' && 'Tanh: Similar to sigmoid but maps to [-1,1], often performs better than sigmoid'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Learning Rate
                  </label>
                  <input
                    type="range"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    value={learningRate}
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                    className="w-full accent-[#e84142]"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0.001</span>
                    <span>{learningRate.toFixed(3)}</span>
                    <span>0.1</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Controls how quickly the network adapts to new information. Higher values can lead to faster learning but may overshoot optimal weights.
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Regularization
                  </label>
                  <select
                    value={regularization}
                    onChange={(e) => setRegularization(e.target.value as RegularizationTechnique)}
                    className="block w-full rounded-md border-[#e84142] bg-[#0f172a] shadow-sm focus:border-[#e84142] focus:ring-[#e84142] text-white sm:text-sm"
                  >
                    <option value="none">None</option>
                    <option value="dropout">Dropout</option>
                    <option value="l2">L2 Regularization</option>
                  </select>
                  <div className="mt-1 text-xs text-gray-400">
                    {regularization === 'none' && 'No regularization applied'}
                    {regularization === 'dropout' && 'Dropout: Randomly deactivates neurons during training to prevent overfitting'}
                    {regularization === 'l2' && 'L2: Penalizes large weights to prevent overfitting'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Optimizer
                  </label>
                  <select
                    value={optimizer}
                    onChange={(e) => setOptimizer(e.target.value as Optimizer)}
                    className="block w-full rounded-md border-[#e84142] bg-[#0f172a] shadow-sm focus:border-[#e84142] focus:ring-[#e84142] text-white sm:text-sm"
                  >
                    <option value="sgd">SGD</option>
                    <option value="adam">Adam</option>
                    <option value="rmsprop">RMSprop</option>
                  </select>
                  <div className="mt-1 text-xs text-gray-400">
                    {optimizer === 'sgd' && 'Stochastic Gradient Descent: Simple but effective optimizer'}
                    {optimizer === 'adam' && 'Adam: Adaptive optimizer that often converges faster than SGD'}
                    {optimizer === 'rmsprop' && 'RMSprop: Maintains per-parameter learning rates based on gradient history'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2 text-white">Network Preview</h3>
          <div 
            ref={canvasRef}
            className="bg-[#0f172a] rounded-lg border border-[#e84142] h-64 flex items-center justify-center"
          >
            {playerNetwork ? (
              <div className="flex items-center space-x-8">
                {playerNetwork.layers.map((layer, layerIndex) => (
                  <div key={layer.id} className="flex flex-col items-center">
                    <div className="text-xs font-medium mb-2 text-gray-300">
                      {layer.type.charAt(0).toUpperCase() + layer.type.slice(1)} Layer
                    </div>
                    <div className="flex flex-col space-y-2">
                      {layer.neurons.map((neuron, neuronIndex) => {
                        // For RGB inputs, color the neurons
                        let neuronColor = '';
                        if (layer.type === 'input' && currentLevel.dataset === 'rgb-classification') {
                          if (neuronIndex === 0) neuronColor = 'bg-red-500';
                          else if (neuronIndex === 1) neuronColor = 'bg-green-500';
                          else if (neuronIndex === 2) neuronColor = 'bg-blue-500';
                        }
                        
                        return (
                          <div 
                            key={neuron.id}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              neuronColor || (
                                layer.type === 'input' 
                                  ? 'bg-[#3b82f6]' 
                                  : layer.type === 'hidden' 
                                    ? 'bg-[#8b5cf6]' 
                                    : 'bg-[#e84142]'
                              )
                            } text-white text-xs shadow-md`}
                          >
                            {neuron.id.split('-')[1]}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <Zap className="w-8 h-8 mb-2 text-[#e84142]" />
                <span>Generate a network to see preview</span>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <button
              onClick={generateNetwork}
              className="w-full bg-[#e84142] text-white py-2 px-4 rounded-md hover:bg-[#c5383a] focus:outline-none focus:ring-2 focus:ring-[#e84142] focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              <Brain className="w-5 h-5 mr-2" />
              Generate Network
            </button>
          </div>
          
          {playerNetwork && (
            <div className="mt-4 bg-[#0f172a] p-3 rounded-md border border-[#e84142]">
              <h4 className="text-sm font-medium text-gray-300 mb-1">Network Summary</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Layers: Input ({inputNeurons}) → Hidden ({hiddenNeurons}) → Output ({outputNeurons})</div>
                <div>Total Parameters: {playerNetwork.connections.length}</div>
                <div>Activation: {activationFunction.toUpperCase()}</div>
                <div>Learning Rate: {learningRate}</div>
                <div>Regularization: {regularization}</div>
                <div>Optimizer: {optimizer}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkBuilder;