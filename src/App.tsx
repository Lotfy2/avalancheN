import React, { useState } from 'react';
import NetworkBuilder from './components/NetworkBuilder';
import TrainingSimulator from './components/TrainingSimulator';
import NetworkVisualizer from './components/NetworkVisualizer';
import Leaderboard from './components/Leaderboard';
import WalletConnect from './components/WalletConnect';
import GameLevel from './components/GameLevel';
import { Brain, BarChart2, Trophy, Info, Snowflake, Zap, ChevronRight } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('build');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
      {/* Header */}
      <header className="bg-[#0f172a] shadow-lg border-b border-[#e84142]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Snowflake className="h-8 w-8 text-[#e84142]" />
              <h1 className="ml-2 text-2xl font-bold text-white">Neural Network <span className="text-[#e84142]">Avalanche</span></h1>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Level Info */}
        <GameLevel />
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-[#e84142]">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('build')}
                className={`${
                  activeTab === 'build'
                    ? 'border-[#e84142] text-[#e84142]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Brain className="w-5 h-5 mr-2" />
                Build Network
              </button>
              <button
                onClick={() => setActiveTab('train')}
                className={`${
                  activeTab === 'train'
                    ? 'border-[#e84142] text-[#e84142]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <BarChart2 className="w-5 h-5 mr-2" />
                Train & Test
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`${
                  activeTab === 'leaderboard'
                    ? 'border-[#e84142] text-[#e84142]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Trophy className="w-5 h-5 mr-2" />
                Leaderboard
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`${
                  activeTab === 'about'
                    ? 'border-[#e84142] text-[#e84142]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Info className="w-5 h-5 mr-2" />
                About
              </button>
            </nav>
          </div>
        </div>
        
        {/* Tab content */}
        <div>
          {activeTab === 'build' && (
            <div className="space-y-6">
              <NetworkBuilder />
              <NetworkVisualizer />
            </div>
          )}
          
          {activeTab === 'train' && (
            <div>
              <TrainingSimulator />
            </div>
          )}
          
          {activeTab === 'leaderboard' && (
            <div>
              <Leaderboard />
            </div>
          )}
          
          {activeTab === 'about' && (
            <div className="bg-[#1e293b] rounded-lg shadow-lg p-6 border border-[#e84142]">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Info className="w-6 h-6 mr-2 text-[#e84142]" />
                About Neural Network Avalanche
              </h2>
              
              <div className="prose prose-invert max-w-none">
                <p>
                  Welcome to Neural Network Avalanche, an interactive educational platform where you can design, optimize, and test artificial neural networks (ANNs) to solve complex challenges on the Avalanche blockchain.
                </p>
                
                <h3>Game Mechanics</h3>
                <p>
                  The game features multiple levels of increasing complexity:
                </p>
                
                <ul>
                  <li>
                    <strong>Level 1: RGB Color Classifier</strong> - Build a neural network that can classify colors based on their RGB values as "warm" or "cool".
                  </li>
                  <li>
                    <strong>Level 2: Pattern Recognition Challenge</strong> - Create an optimized neural network that can identify complex patterns in multi-dimensional data.
                  </li>
                  <li>
                    <strong>Level 3: Efficiency Challenge</strong> - Design the smallest possible neural network that still achieves high accuracy.
                  </li>
                </ul>
                
                <h3>Scoring System</h3>
                <p>
                  Your performance is evaluated based on:
                </p>
                
                <ul>
                  <li><strong>Accuracy</strong> - How well your network classifies the test data</li>
                  <li><strong>Efficiency</strong> - Using fewer neurons while maintaining high accuracy</li>
                  <li><strong>Execution Time</strong> - Faster networks receive bonus points</li>
                </ul>
                
                <h3>Avalanche Blockchain Integration</h3>
                <p>
                  The game integrates with Avalanche blockchain to:
                </p>
                
                <ul>
                  <li>Store your high scores on a decentralized leaderboard</li>
                  <li>Reward top performers with AVAX tokens</li>
                  <li>Issue special NFT badges for achievements</li>
                  <li>Allow trading of optimized networks as NFTs</li>
                </ul>
                
                <h3>How Neural Networks Work</h3>
                <p>
                  Neural networks are computational models inspired by the human brain. They consist of:
                </p>
                
                <ul>
                  <li><strong>Neurons</strong> - Processing units that apply an activation function to their inputs</li>
                  <li><strong>Connections</strong> - Weighted links between neurons that determine how information flows</li>
                  <li><strong>Layers</strong> - Groups of neurons that process information in stages</li>
                </ul>
                
                <p>
                  During training, the network adjusts its weights through backpropagation to minimize the difference between its predictions and the actual outputs.
                </p>
                
                <div className="bg-[#0f172a] p-4 rounded-md mt-4 border border-[#e84142]">
                  <p className="text-[#e84142] flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Connect your wallet to participate in the blockchain features and compete globally!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-[#0f172a] border-t border-[#e84142] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Snowflake className="h-6 w-6 text-[#e84142]" />
              <p className="ml-2 text-sm text-gray-400">
                Neural Network Avalanche © 2025
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="https://www.avax.network/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#e84142] transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="https://www.avax.network/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#e84142] transition-colors text-sm">
                Terms of Service
              </a>
              <a href="https://www.avax.network/contact" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#e84142] transition-colors text-sm">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;