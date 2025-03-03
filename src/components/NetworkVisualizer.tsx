import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';
import * as THREE from 'three';
import { generateSampleDataset } from '../utils/neuralNetworkSimulator';
import { PuzzleLevel } from '../types';
import { Snowflake } from 'lucide-react';

// Component for rendering a neuron
const Neuron: React.FC<{
  position: [number, number, number];
  type: 'input' | 'hidden' | 'output';
  id: string;
  showLabels: boolean;
  color?: string;
}> = ({ position, type, id, showLabels, color }) => {
  const colorMap = {
    input: new THREE.Color(color || 0x3b82f6), // blue or custom color for RGB inputs
    hidden: new THREE.Color(0x8b5cf6), // purple
    output: new THREE.Color(0xe84142)  // Avalanche red
  };
  
  const neuronRef = useRef<THREE.Mesh>(null);
  
  // Add subtle animation to neurons
  useFrame(({ clock }) => {
    if (neuronRef.current) {
      const time = clock.getElapsedTime();
      const offset = id.charCodeAt(id.length - 1) * 0.1; // Different phase for each neuron
      neuronRef.current.scale.setScalar(1 + Math.sin(time * 2 + offset) * 0.05);
    }
  });
  
  return (
    <group>
      <mesh ref={neuronRef} position={position}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial 
          color={colorMap[type]} 
          roughness={0.3}
          metalness={0.2}
          emissive={colorMap[type]}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {showLabels && (
        <Text
          position={[position[0], position[1] + 0.3, position[2]]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {id.split('-')[1]}
        </Text>
      )}
    </group>
  );
};

// Component for rendering a connection between neurons
const Connection: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  weight: number;
}> = ({ start, end, weight }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (ref.current) {
      // Calculate direction vector
      const direction = new THREE.Vector3(
        end[0] - start[0],
        end[1] - start[1],
        end[2] - start[2]
      );
      
      // Calculate length of the connection
      const length = direction.length();
      
      // Normalize direction vector
      direction.normalize();
      
      // Position the cylinder at the midpoint
      ref.current.position.set(
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2
      );
      
      // Orient the cylinder along the direction vector
      ref.current.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
      );
      
      // Scale the cylinder to match the length
      ref.current.scale.set(0.03, length / 2, 0.03);
    }
  }, [start, end]);
  
  // Color based on weight (red for negative, green for positive)
  const color = weight < 0 
    ? new THREE.Color(0xe84142).lerp(new THREE.Color(0xffffff), 1 + weight) 
    : new THREE.Color(0xffffff).lerp(new THREE.Color(0x10b981), weight);
  
  // Thickness based on absolute weight value
  const thickness = 0.03 * (0.5 + Math.min(1, Math.abs(weight)));
  
  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[thickness, thickness, 1, 8]} />
      <meshStandardMaterial 
        color={color} 
        transparent={true}
        opacity={0.7}
      />
    </mesh>
  );
};

// Component for creating a grid
const Grid: React.FC = () => {
  return (
    <gridHelper 
      args={[10, 10, 0x334155, 0x1e293b]} 
      position={[0, -2, 0]} 
      rotation={[0, 0, 0]}
    />
  );
};

// Component for animating the network
const AnimatedNetwork: React.FC<{
  showLabels: boolean;
  showColors: boolean;
}> = ({ showLabels, showColors }) => {
  const { playerNetwork, currentLevel } = useGameStore();
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate sample data for RGB visualization
  const [sampleData, setSampleData] = useState<any[]>([]);
  
  useEffect(() => {
    if (playerNetwork && currentLevel.dataset === 'rgb-classification' && showColors) {
      const samples = generateSampleDataset(currentLevel.dataset, 3);
      setSampleData(samples);
    }
  }, [playerNetwork, currentLevel.dataset, showColors]);
  
  // Animate the network
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.2;
    }
  });
  
  if (!playerNetwork) return null;
  
  // Scale factor for positioning
  const scaleFactor = 1.5;
  
  // Check if this is a puzzle level with RGB inputs
  const isPuzzleLevel = 'constraints' in currentLevel;
  const isRgbClassification = currentLevel.dataset === 'rgb-classification';
  
  return (
    <group ref={groupRef}>
      {/* Render neurons */}
      {playerNetwork.layers.flatMap((layer, layerIndex) => 
        layer.neurons.map((neuron, neuronIndex) => {
          // For RGB classification, color the input neurons with their respective colors
          let neuronColor;
          if (showColors && isRgbClassification && layer.type === 'input') {
            if (neuronIndex === 0) neuronColor = '#ff0000'; // Red
            if (neuronIndex === 1) neuronColor = '#00ff00'; // Green
            if (neuronIndex === 2) neuronColor = '#0000ff'; // Blue
          }
          
          return (
            <Neuron
              key={neuron.id}
              id={neuron.id}
              position={[
                neuron.position.x * scaleFactor,
                neuron.position.y * scaleFactor,
                neuron.position.z * scaleFactor
              ]}
              type={neuron.type}
              showLabels={showLabels}
              color={neuronColor}
            />
          );
        })
      )}
      
      {/* Render connections */}
      {playerNetwork.connections.map(connection => {
        const sourceNeuron = playerNetwork.layers
          .flatMap(l => l.neurons)
          .find(n => n.id === connection.sourceId);
          
        const targetNeuron = playerNetwork.layers
          .flatMap(l => l.neurons)
          .find(n => n.id === connection.targetId);
          
        if (!sourceNeuron || !targetNeuron) return null;
        
        return (
          <Connection
            key={connection.id}
            start={[
              sourceNeuron.position.x * scaleFactor,
              sourceNeuron.position.y * scaleFactor,
              sourceNeuron.position.z * scaleFactor
            ]}
            end={[
              targetNeuron.position.x * scaleFactor,
              targetNeuron.position.y * scaleFactor,
              targetNeuron.position.z * scaleFactor
            ]}
            weight={connection.weight}
          />
        );
      })}
      
      {/* Show sample data colors for RGB classification */}
      {showColors && isRgbClassification && sampleData.length > 0 && (
        <group position={[0, 3, 0]}>
          {sampleData.map((sample, index) => (
            <mesh key={index} position={[index - 1, 0, 0]}>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color={sample.color} emissive={sample.color} emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

const NetworkVisualizer: React.FC = () => {
  const { playerNetwork, currentLevel } = useGameStore();
  const [showLabels, setShowLabels] = useState(true);
  const [rotateCamera, setRotateCamera] = useState(true);
  const [showColors, setShowColors] = useState(true);
  
  // Check if this is a puzzle level with RGB inputs
  const isPuzzleLevel = 'constraints' in currentLevel;
  const isRgbClassification = currentLevel.dataset === 'rgb-classification';
  
  return (
    <div className="bg-[#1e293b] rounded-lg shadow-lg p-6 mb-6 border border-[#e84142]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Snowflake className="w-6 h-6 mr-2 text-[#e84142]" />
          3D Network Visualization
        </h2>
        
        {playerNetwork && (
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={() => setShowLabels(!showLabels)}
                className="form-checkbox h-4 w-4 text-[#e84142] bg-[#0f172a] border-[#e84142]"
              />
              <span className="ml-2 text-sm text-gray-300">Show Labels</span>
            </label>
            
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={rotateCamera}
                onChange={() => setRotateCamera(!rotateCamera)}
                className="form-checkbox h-4 w-4 text-[#e84142] bg-[#0f172a] border-[#e84142]"
              />
              <span className="ml-2 text-sm text-gray-300">Auto-Rotate</span>
            </label>
            
            {isRgbClassification && (
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showColors}
                  onChange={() => setShowColors(!showColors)}
                  className="form-checkbox h-4 w-4 text-[#e84142] bg-[#0f172a] border-[#e84142]"
                />
                <span className="ml-2 text-sm text-gray-300">Show Colors</span>
              </label>
            )}
          </div>
        )}
      </div>
      
      <div className="h-80 bg-[#0f172a] rounded-lg border border-[#e84142]">
        {playerNetwork ? (
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
            <AnimatedNetwork showLabels={showLabels} showColors={showColors} />
            <Grid />
            <OrbitControls 
              enableZoom={true} 
              enablePan={true} 
              autoRotate={rotateCamera}
              autoRotateSpeed={0.5}
            />
            <fog attach="fog" args={['#0f172a', 8, 15]} />
          </Canvas>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Generate a network to see 3D visualization
          </div>
        )}
      </div>
      
      {playerNetwork && (
        <div className="mt-4 text-sm text-gray-300 bg-[#0f172a] p-3 rounded-md border border-[#e84142]">
          <p>
            <span className="font-medium">Visualization Guide:</span> Blue spheres represent input neurons, 
            purple spheres are hidden neurons, and red spheres are output neurons. 
            Connection colors indicate weight values (green for positive, red for negative).
            Use mouse to rotate, zoom and pan the visualization.
          </p>
          
          {isRgbClassification && (
            <p className="mt-2">
              <span className="font-medium">RGB Inputs:</span> The input neurons are colored to represent RGB values.
              {showColors && " Sample color boxes above the network show examples from the dataset."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkVisualizer;