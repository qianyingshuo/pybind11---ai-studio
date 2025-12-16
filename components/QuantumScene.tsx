
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Icosahedron, Box, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';

const GeometricNode = ({ position, color, shape = 'sphere' }: { position: [number, number, number]; color: string; shape?: 'sphere' | 'box' | 'ico' }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.rotation.x = t * 0.2;
      ref.current.rotation.y = t * 0.3;
      // Gentle bobbing
      ref.current.position.y = position[1] + Math.sin(t + position[0]) * 0.1;
    }
  });

  const material = (
    <MeshDistortMaterial
        color={color}
        envMapIntensity={1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={0.6}
        roughness={0.4}
        distort={0.2}
        speed={2}
    />
  );

  if (shape === 'box') {
      return <Box ref={ref} args={[1, 1, 1]} position={position}>{material}</Box>;
  }
  if (shape === 'ico') {
      return <Icosahedron ref={ref} args={[1, 0]} position={position}>{material}</Icosahedron>;
  }
  return <Sphere ref={ref} args={[0.8, 32, 32]} position={position}>{material}</Sphere>;
};

export const HeroScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          {/* C++ Representation (Blueish) */}
          <GeometricNode position={[-2, 0.5, 0]} color="#306998" shape="box" />
          
          {/* Python Representation (Yellowish) */}
          <GeometricNode position={[2, -0.5, -1]} color="#FFD43B" shape="ico" />
          
          {/* Connector Node */}
          <GeometricNode position={[0, 0, -2]} color="#C5A059" shape="sphere" />
        </Float>
        
        <Environment preset="city" />
        <Stars radius={100} depth={50} count={800} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};

export const NetworkScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={1} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#306998" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#FFD43B"/>
        <Environment preset="studio" />
        
        <Float rotationIntensity={0.4} floatIntensity={0.2} speed={1}>
          <group rotation={[0, 0, 0]}>
             {/* Central Hub */}
            <Icosahedron args={[1, 1]}>
               <meshStandardMaterial color="#333" wireframe />
            </Icosahedron>
            
            {/* Satellite Nodes representing libraries/modules */}
            {[...Array(6)].map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                const radius = 2.5;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return (
                    <group key={i} position={[x, y, 0]}>
                        <Sphere args={[0.2, 16, 16]}>
                             <meshStandardMaterial color={i % 2 === 0 ? "#306998" : "#FFD43B"} />
                        </Sphere>
                        {/* Connection Line */}
                        <mesh position={[-x/2, -y/2, 0]} rotation={[0, 0, angle]}>
                             <boxGeometry args={[radius, 0.02, 0.02]} />
                             <meshStandardMaterial color="#aaa" />
                        </mesh>
                    </group>
                )
            })}
          </group>
        </Float>
      </Canvas>
    </div>
  );
}
