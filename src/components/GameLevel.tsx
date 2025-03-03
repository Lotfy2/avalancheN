import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Brain, Target, Award, Trophy, Info, AlertCircle, Zap, BookOpen, Snowflake } from 'lucide-react';
import { PuzzleLevel } from '../types';

const GameLevel: React.FC = () => {
  const { currentLevel, accuracy, score, advanceToNextLevel } = useGameStore();
  
  // Check if player has completed the current level
  const isLevelCompleted = accuracy >= currentLevel.targetAccuracy;
  
  // Check if the current level has puzzle-specific properties
  const isPuzzleLevel = 'hints' in currentLevel;
  const puzzleLevel = currentLevel as PuzzleLevel;
  
  return (
    <div className="bg-[#1e293b] rounded-lg shadow-lg p-6 mb-6 border border-[#e84142]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Snowflake className="w-6 h-6 mr-2 text-[#e84142]" />
          <h2 className="text-xl font-bold text-white">Level {currentLevel.id}: {currentLevel.name}</h2>
        </div>
        <div className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
          currentLevel.difficulty === 'basic' 
            ? 'bg-[#334155] text-[#e84142]' 
            : 'bg-[#334155] text-[#e84142]'
        }`}>
          {currentLevel.difficulty === 'basic' ? 'Basic' : 'Advanced'}
        </div>
      </div>
      
      <p className="text-gray-300 mb-4">{currentLevel.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-[#0f172a] p-3 rounded-md border border-[#e84142]">
          <div className="flex items-center text-sm font-medium text-gray-300 mb-1">
            <Target className="w-4 h-4 mr-1 text-[#e84142]" />
            Target Accuracy
          </div>
          <div className="text-lg font-bold text-white">
            {(currentLevel.targetAccuracy * 100).toFixed(2)}%
          </div>
        </div>
        
        <div className="bg-[#0f172a] p-3 rounded-md border border-[#e84142]">
          <div className="flex items-center text-sm font-medium text-gray-300 mb-1">
            <Award className="w-4 h-4 mr-1 text-[#e84142]" />
            Current Score
          </div>
          <div className="text-lg font-bold text-white">
            {score}
          </div>
        </div>
        
        <div className="bg-[#0f172a] p-3 rounded-md border border-[#e84142]">
          <div className="flex items-center text-sm font-medium text-gray-300 mb-1">
            <Brain className="w-4 h-4 mr-1 text-[#e84142]" />
            Max Neurons
          </div>
          <div className="text-lg font-bold text-white">
            {currentLevel.maxNeurons}
          </div>
        </div>
      </div>
      
      {isPuzzleLevel && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-[#0f172a] p-3 rounded-md border border-[#e84142]">
            <div className="flex items-center text-sm font-medium text-gray-300 mb-1">
              <BookOpen className="w-4 h-4 mr-1 text-[#e84142]" />
              Network Requirements
            </div>
            <div className="text-sm text-gray-300">
              <p><strong>Input:</strong> {puzzleLevel.inputDescription}</p>
              <p><strong>Output:</strong> {puzzleLevel.outputDescription}</p>
            </div>
          </div>
          
          <div className="bg-[#0f172a] p-3 rounded-md border border-[#e84142]">
            <div className="flex items-center text-sm font-medium text-gray-300 mb-1">
              <Trophy className="w-4 h-4 mr-1 text-[#e84142]" />
              Reward
            </div>
            <div className="text-sm text-gray-300">
              <p><strong>Points:</strong> {puzzleLevel.reward.points}</p>
              <p><strong>Badge:</strong> {puzzleLevel.reward.badge.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
          </div>
        </div>
      )}
      
      {!isLevelCompleted && (
        <div className="bg-[#0f172a] border border-[#e84142] rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-[#e84142]" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-white">Level Objective</h3>
              <div className="mt-2 text-sm text-gray-300">
                <p>Train your neural network to achieve at least {(currentLevel.targetAccuracy * 100).toFixed(2)}% accuracy. Use the Network Builder to create your architecture, then train it in the Training Simulator.</p>
              </div>
              
              {isPuzzleLevel && puzzleLevel.hints.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-white">Hints:</h4>
                  <ul className="mt-1 text-sm text-gray-300 list-disc pl-5 space-y-1">
                    {puzzleLevel.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {isLevelCompleted && currentLevel.id < 3 && (
        <div className="bg-[#0f172a] border border-[#e84142] rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Award className="h-5 w-5 text-[#e84142]" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-white">Level Completed!</h3>
              <div className="mt-2 text-sm text-gray-300">
                <p>Congratulations! You've reached the target accuracy for this level. You can now advance to the next level for more challenges and optimization opportunities.</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={advanceToNextLevel}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#e84142] hover:bg-[#c5383a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e84142]"
                >
                  Advance to Level {currentLevel.id + 1}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isLevelCompleted && currentLevel.id === 3 && (
        <div className="bg-[#0f172a] border border-[#e84142] rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Trophy className="h-5 w-5 text-[#e84142]" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-white">Game Completed!</h3>
              <div className="mt-2 text-sm text-gray-300">
                <p>Amazing work! You've mastered neural network optimization. Your score has been recorded on the Avalanche blockchain leaderboard. Check your ranking and see if you've earned rewards!</p>
              </div>
              <div className="mt-2 text-sm text-gray-300">
                <p>Feel free to continue experimenting with different network architectures to improve your score and climb the leaderboard rankings.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLevel;