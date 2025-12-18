
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Box, Environment, Stars, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

// Represents a single memory chunk in the pool
const MemoryBlock: React.FC<{ position: [number, number, number]; color: string, speed?: number }> = ({ position, color, speed = 1 }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() * speed;
      // Subtle "breathing" effect to show active memory
      ref.current.scale.setScalar(1 + Math.sin(t + position[0] * 10) * 0.05);
    }
  });

  return (
    <Box ref={ref} args={[0.8, 0.8, 0.8]} position={position}>
      <meshPhysicalMaterial
        color={color}
        roughness={0.2}
        metalness={0.8}
        clearcoat={1}
        transparent
        opacity={0.9}
      />
    </Box>
  );
};

export const HeroScene: React.FC = () => {
  // Create a grid of blocks to represent contiguous memory
  const blocks = useMemo(() => {
    const temp = [];
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        // Skip center to leave room for title or just style
        if (x === 0 && y === 0) continue; 
        temp.push({
            pos: [x * 1.2, y * 1.2, 0] as [number, number, number],
            color: (x + y) % 2 === 0 ? "#10B981" : "#34D399" // Tech Green variants
        });
      }
    }
    return temp;
  }, []);

  return (
    <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#10B981" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3B82F6" />
        
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
           <group rotation={[0.2, 0.2, 0]}>
              {blocks.map((b, i) => (
                  <MemoryBlock key={i} position={b.pos} color={b.color} speed={0.5 + Math.random() * 0.5} />
              ))}
           </group>
        </Float>
        
        <Environment preset="city" />
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};

export const NetworkScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#10B981" />
        
        <Float rotationIntensity={0.4} floatIntensity={0.2} speed={1}>
          <group rotation={[0, 0, 0]}>
             {/* Abstract Representation of a Pointer/Allocator */}
            <Box args={[4, 0.2, 0.2]} position={[0, 1, 0]}>
               <meshStandardMaterial color="#334155" />
            </Box>
            <Box args={[4, 0.2, 0.2]} position={[0, -1, 0]}>
               <meshStandardMaterial color="#334155" />
            </Box>
            
            {/* Data moving between */}
            {[...Array(5)].map((_, i) => (
                <Box key={i} args={[0.5, 0.5, 0.5]} position={[(i-2) * 0.8, 0, 0]}>
                    <meshStandardMaterial color={i === 2 ? "#EF4444" : "#10B981"} />
                </Box>
            ))}
          </group>
        </Float>
      </Canvas>
    </div>
  );
}
