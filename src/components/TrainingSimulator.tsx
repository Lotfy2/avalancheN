import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { simulateTraining, generateSampleDataset } from '../utils/neuralNetworkSimulator';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Play, Pause, BarChart2, Clock, Save, Award, AlertTriangle, Snowflake } from 'lucide-react';
import { submitScore, generateNetworkHash, saveNetwork } from '../utils/web3Utils';
import { PuzzleLevel } from '../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TrainingSimulator: React.FC = () => {
  const { 
    playerNetwork, 
    currentLevel, 
    isTraining, 
    trainingProgress,
    accuracy,
    loss,
    executionTime,
    score,
    isWalletConnected,
    walletAddress,
    startTraining, 
    stopTraining,
    updateTrainingMetrics
  } = useGameStore();
  
  const [epochs, setEpochs] = useState(10);
  const [accuracyHistory, setAccuracyHistory] = useState<number[]>([]);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [epochLabels, setEpochLabels] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSavingNetwork, setIsSavingNetwork] = useState(false);
  const [networkSaved, setNetworkSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sampleData, setSampleData] = useState<any[]>([]);
  
  // Check if the current level is a puzzle level
  const isPuzzleLevel = 'constraints' in currentLevel;
  const puzzleLevel = currentLevel as PuzzleLevel;
  
  // Reset submission status when network changes
  useEffect(() => {
    setSubmissionSuccess(false);
    setNetworkSaved(false);
  }, [playerNetwork]);
  
  // Generate sample data for visualization
  useEffect(() => {
    if (playerNetwork && currentLevel.dataset) {
      const samples = generateSampleDataset(currentLevel.dataset, 6);
      setSampleData(samples);
    }
  }, [playerNetwork, currentLevel.dataset]);
  
  // Start training simulation
  const handleStartTraining = async () => {
    if (!playerNetwork) {
      setErrorMessage("Please generate a network first");
      return;
    }
    
    // Reset histories and error message
    setAccuracyHistory([]);
    setLossHistory([]);
    setEpochLabels([]);
    setSubmissionSuccess(false);
    setNetworkSaved(false);
    setErrorMessage(null);
    
    startTraining();
    
    try {
      // Simulate training
      const result = await simulateTraining(
        playerNetwork,
        currentLevel.dataset,
        epochs,
        10,
        (epoch, accuracy, loss) => {
          // Update histories
          setAccuracyHistory(prev => [...prev, accuracy]);
          setLossHistory(prev => [...prev, loss]);
          setEpochLabels(prev => [...prev, `Epoch ${epoch + 1}`]);
          
          // Update store with latest metrics
          updateTrainingMetrics(accuracy, loss, (epoch + 1) * 0.5);
        }
      );
      
      // Final update with the complete results
      updateTrainingMetrics(result.finalAccuracy, result.finalLoss, result.executionTime);
      stopTraining();
    } catch (error) {
      console.error('Error during training:', error);
      setErrorMessage("An error occurred during training");
      stopTraining();
    }
  };
  
  // Submit score to blockchain
  const handleSubmitScore = async () => {
    if (!playerNetwork || !isWalletConnected || !walletAddress) return;
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Calculate efficiency based on network size vs max neurons
      const networkSize = playerNetwork.layers.reduce(
        (sum, layer) => sum + layer.neurons.length, 0
      );
      const efficiency = Math.max(0, 1 - (networkSize / (currentLevel.maxNeurons * 3)));
      
      // Calculate innovation based on architecture choices
      const innovation = calculateInnovation(playerNetwork);
      
      // Generate a hash of the network for on-chain storage
      const networkHash = generateNetworkHash(playerNetwork);
      
      // Submit to blockchain
      const success = await submitScore(
        walletAddress,
        score,
        accuracy,
        efficiency,
        innovation,
        networkHash
      );
      
      setSubmissionSuccess(success);
    } catch (error) {
      console.error('Error submitting score:', error);
      setErrorMessage("Failed to submit score to the blockchain");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Save network to blockchain
  const handleSaveNetwork = async () => {
    if (!playerNetwork || !isWalletConnected || !walletAddress) return;
    
    setIsSavingNetwork(true);
    setErrorMessage(null);
    
    try {
      // Save network to blockchain
      const success = await saveNetwork(
        playerNetwork,
        walletAddress,
        accuracy
      );
      
      setNetworkSaved(success);
    } catch (error) {
      console.error('Error saving network:', error);
      setErrorMessage("Failed to save network to the blockchain");
    } finally {
      setIsSavingNetwork(false);
    }
  };
  
  // Calculate innovation score based on network architecture
  const calculateInnovation = (network: any) => {
    let score = 0;
    
    // More points for using advanced activation functions
    if (network.activationFunction !== 'relu') {
      score += 0.2;
    }
    
    // Points for using regularization
    if (network.regularization !== 'none') {
      score += 0.3;
    }
    
    // Points for using advanced optimizers
    if (network.optimizer !== 'sgd') {
      score += 0.2;
    }
    
    // Points for optimal learning rate (not too high, not too low)
    if (network.learningRate >= 0.005 && network.learningRate <= 0.05) {
      score += 0.2;
    }
    
    // Bonus for level-specific optimizations
    if (isPuzzleLevel) {
      if (currentLevel.id === 2 && network.activationFunction === 'tanh') {
        // Level 2 hint suggests tanh might be better
        score += 0.1;
      }
      
      if (currentLevel.id === 3 && network.layers[1].neurons.length <= 3) {
        // Level 3 is about efficiency
        score += 0.1;
      }
    }
    
    return Math.min(1, score);
  };
  
  // Chart data for accuracy
  const accuracyData = {
    labels: epochLabels,
    datasets: [
      {
        label: 'Accuracy',
        data: accuracyHistory,
        borderColor: 'rgb(232, 65, 66)',
        backgroundColor: 'rgba(232, 65, 66, 0.5)',
        tension: 0.1
      }
    ]
  };
  
  // Chart data for loss
  const lossData = {
    labels: epochLabels,
    datasets: [
      {
        label: 'Loss',
        data: lossHistory,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e2e8f0'
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#1e293b',
        borderColor: '#e84142',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        padding: 10
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#2d3748'
        },
        ticks: {
          color: '#e2e8f0'
        }
      },
      x: {
        grid: {
          color: '#2d3748'
        },
        ticks: {
          color: '#e2e8f0'
        }
      }
    }
  };
  
  return (
    <div className="bg-[#1e293b] rounded-lg shadow-lg p-6 border border-[#e84142]">
      <div className="flex items-center mb-4">
        <Snowflake className="w-6 h-6 mr-2 text-[#e84142]" />
        <h2 className="text-xl font-bold text-white">Training Simulator</h2>
      </div>
      
      {errorMessage && (
        <div className="mb-4 bg-[#450a0a] border border-[#b91c1c] text-white px-4  py-3 rounded-md flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-[#e84142]" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {currentLevel.dataset === 'rgb-classification' && sampleData.length > 0 && (
        <div className="mb-6 bg-[#0f172a] p-4 rounded-lg border border-[#e84142]">
          <h3 className="text-md font-semibold mb-3 text-white">Sample Data</h3>
          <div className="flex flex-wrap gap-3">
            {sampleData.map((sample, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-12 h-12 rounded-md shadow-sm border border-[#2d3748]" 
                  style={{ backgroundColor: sample.color }}
                ></div>
                <span className="text-xs mt-1 font-medium text-gray-300">{sample.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            These are sample colors from the dataset. Your network needs to classify them as "Warm" or "Cool".
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Training Epochs
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={epochs}
              onChange={(e) => setEpochs(parseInt(e.target.value))}
              className="w-full accent-[#e84142]"
              disabled={isTraining}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>5</span>
              <span>{epochs}</span>
              <span>50</span>
            </div>
          </div>
          
          <div className="mb-6">
            <button
              onClick={handleStartTraining}
              disabled={!playerNetwork || isTraining}
              className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
                !playerNetwork || isTraining
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-[#e84142] hover:bg-[#c5383a] text-white'
              } focus:outline-none focus:ring-2 focus:ring-[#e84142] focus:ring-offset-2 transition-colors`}
            >
              {isTraining ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Training in Progress...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Training
                </>
              )}
            </button>
          </div>
          
          {isTraining && (
            <div className="mb-6">
              <div className="w-full bg-[#0f172a] rounded-full h-2.5 border border-[#2d3748]">
                <div 
                  className="bg-[#e84142] h-2.5 rounded-full" 
                  style={{ width: `${trainingProgress * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-1 text-right">
                {Math.round(trainingProgress * 100)}% Complete
              </div>
            </div>
          )}
          
          {!isTraining && accuracy > 0 && (
            <div className="space-y-3 mb-6">
              <button
                onClick={handleSubmitScore}
                disabled={!isWalletConnected || isSubmitting || submissionSuccess}
                className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
                  !isWalletConnected || isSubmitting || submissionSuccess
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-[#10b981] hover:bg-[#059669] text-white'
                } focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 transition-colors`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting to Blockchain...
                  </>
                ) : submissionSuccess ? (
                  <>
                    <Award className="w-5 h-5 mr-2" />
                    Score Submitted Successfully!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Submit Score to Leaderboard
                  </>
                )}
              </button>
              
              <button
                onClick={handleSaveNetwork}
                disabled={!isWalletConnected || isSavingNetwork || networkSaved}
                className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
                  !isWalletConnected || isSavingNetwork || networkSaved
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
                } focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 transition-colors`}
              >
                {isSavingNetwork ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving Network...
                  </>
                ) : networkSaved ? (
                  <>
                    <Award className="w-5 h-5 mr-2" />
                    Network Saved Successfully!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Network to Blockchain
                  </>
                )}
              </button>
              
              {!isWalletConnected && (
                <div className="text-xs text-[#fbbf24] mt-1 text-center">
                  Connect your wallet to submit your score and save your network
                </div>
              )}
            </div>
          )}
          
          <div className="bg-[#0f172a] rounded-lg p-4 border border-[#e84142]">
            <h3 className="text-lg font-semibold mb-3 text-white">Performance Metrics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1e293b] p-3 rounded-md shadow-sm border border-[#e84142]">
                <div className="text-sm text-gray-400 mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-[#e84142]">
                  {(accuracy * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-gray-400">
                  Target: {(currentLevel.targetAccuracy * 100).toFixed(2)}%
                </div>
              </div>
              
              <div className="bg-[#1e293b] p-3 rounded-md shadow-sm border border-[#e84142]">
                <div className="text-sm text-gray-400 mb-1">Loss</div>
                <div className="text-2xl font-bold text-[#3b82f6]">
                  {loss.toFixed(4)}
                </div>
              </div>
              
              <div className="bg-[#1e293b] p-3 rounded-md shadow-sm border border-[#e84142]">
                <div className="text-sm text-gray-400 mb-1">Execution Time</div>
                <div className="text-2xl font-bold text-[#fbbf24] flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {executionTime.toFixed(2)}s
                </div>
              </div>
              
              <div className="bg-[#1e293b] p-3 rounded-md shadow-sm border border-[#e84142]">
                <div className="text-sm text-gray-400 mb-1">Score</div>
                <div className="text-2xl font-bold text-[#10b981]">
                  {score}
                </div>
                {isPuzzleLevel && (
                  <div className="text-xs text-gray-400">
                    Reward: {puzzleLevel.reward.points} pts
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {isPuzzleLevel && (
            <div className="mt-4 bg-[#0f172a] p-3 rounded-md border border-[#e84142]">
              <h3 className="text-sm font-medium text-white mb-2">Level Tips</h3>
              <ul className="text-xs text-gray-300 list-disc pl-5 space-y-1">
                {puzzleLevel.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-white">Accuracy Over Time</h3>
            <div className="bg-[#0f172a] p-2 rounded-md shadow-sm h-48 border border-[#e84142]">
              {accuracyHistory.length > 0 ? (
                <Line data={accuracyData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Start training to see accuracy metrics
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">Loss Over Time</h3>
            <div className="bg-[#0f172a] p-2 rounded-md shadow-sm h-48 border border-[#e84142]">
              {lossHistory.length > 0 ? (
                <Line data={lossData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Start training to see loss metrics
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingSimulator;