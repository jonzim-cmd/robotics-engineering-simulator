'use client';

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Level3_TerrainViewerProps {
  className?: string;
  autoRotate?: boolean;
}

// TerrainFloor: Unebener Boden mit integrierten Pfützen
function TerrainFloor() {
  // Generiere unebenes Terrain
  const terrainGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 64, 64);
    const posAttribute = geo.attributes.position;
    
    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const y = posAttribute.getY(i);
      
      // "Noise"-Simulation durch Sinus-Wellenüberlagerung
      let z = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.5;
      z += Math.sin(x * 1.2 + y * 0.8) * 0.1;
      z += (Math.random() - 0.5) * 0.05; // Rauschen
      
      // Pfützen-Bereiche flach drücken (wo z < -0.2 ist)
      if (z < -0.2) {
         z = -0.3; // Wasser-Level
      }

      posAttribute.setZ(i, z);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      {/* Der Boden */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={terrainGeometry} receiveShadow castShadow>
        <meshStandardMaterial 
          color="#5d4037" 
          roughness={0.9} 
          metalness={0.1}
          flatShading={false}
        />
      </mesh>

      {/* Wasserpfützen (Flache Planes auf Wasser-Level) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
         <planeGeometry args={[20, 20]} />
         <meshStandardMaterial 
            color="#1e293b" 
            transparent 
            opacity={0.8}
            roughness={0.1} 
            metalness={0.8} 
         />
      </mesh>
    </group>
  );
}

// Obstacles: Steine und Geröll
function Obstacles() {
  const stones = useMemo(() => {
    const positions: Array<{ pos: [number, number, number]; scale: number; color: string; rot: [number, number, number] }> = [];
    const colors = ['#64748b', '#475569', '#334155'];

    // Mehr Steine für "Geröll"-Look
    for (let i = 0; i < 40; i++) {
      // Zufällige Position im Radius 8
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Nicht in Pfützen (grob geschätzt durch Noise-Logik, hier zufällig)
      // Einfachheitshalber überall
      
      const scale = 0.1 + Math.random() * 0.4;
      positions.push({
        pos: [x, scale * 0.5 - 0.2, z], // Leicht im Boden
        scale,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: [Math.random() * 3, Math.random() * 3, Math.random() * 3]
      });
    }
    return positions;
  }, []);

  return (
    <group>
      {stones.map((stone, idx) => (
        <mesh key={idx} position={stone.pos} rotation={stone.rot} scale={stone.scale} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={stone.color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// Targets: Container
function Targets() {
  return (
    <group>
      {/* Container 1 */}
      <group position={[-3, 0.2, 2]} rotation={[0.1, 0.3, -0.05]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 1, 2.5]} />
          <meshStandardMaterial color="#c2410c" roughness={0.7} />
        </mesh>
      </group>

      {/* Container 2 */}
      <group position={[4, 0.5, -3]} rotation={[-0.1, -0.5, 0.1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 1, 2.5]} />
          <meshStandardMaterial color="#9a3412" roughness={0.7} />
        </mesh>
      </group>
      
      {/* Container 3 */}
      <group position={[1, 0.1, -5]} rotation={[0, 0.8, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 1, 2.5]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

export function Level3_TerrainViewer({ className, autoRotate = false }: Level3_TerrainViewerProps) {
  return (
    <div className={className}>
      <Canvas shadows camera={{ position: [8, 6, 8], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        
        {/* Environment */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[-5, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        >
           <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
        </directionalLight>
        
        <fog attach="fog" args={['#0f172a', 8, 25]} />

        {/* World */}
        <group position={[0, -0.5, 0]}>
          <TerrainFloor />
          <Obstacles />
          <Targets />
        </group>

        {/* Interaction */}
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={5}
          maxDistance={20}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
