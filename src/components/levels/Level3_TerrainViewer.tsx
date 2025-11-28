'use client';

import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Level3_TerrainViewerProps {
  className?: string;
  autoRotate?: boolean;
}

type StoneInstance = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
};

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const randomInRange = (seed: number, min: number, max: number) => {
  return min + pseudoRandom(seed) * (max - min);
};

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
      z += (pseudoRandom(x * 12.9898 + y * 78.233) - 0.5) * 0.05; // Rauschen
      
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
function InstancedObstacles() {
  const stones = useMemo<StoneInstance[]>(() => {
    const positions: StoneInstance[] = [];
    const colors = ['#64748b', '#475569', '#334155'];

    for (let i = 0; i < 40; i++) {
      const angle = randomInRange(i * 1.7, 0, Math.PI * 2);
      const radius = randomInRange(i * 2.3 + 5, 2, 8);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const scale = randomInRange(i * 3.1 + 9, 0.1, 0.5);
      positions.push({
        position: [x, scale * 0.5 - 0.2, z],
        scale,
        color: colors[Math.floor(randomInRange(i * 4.7 + 11, 0, colors.length))],
        rotation: [
          randomInRange(i * 5.3 + 13, 0, 3),
          randomInRange(i * 6.1 + 17, 0, 3),
          randomInRange(i * 7.9 + 19, 0, 3),
        ],
      });
    }
    return positions;
  }, []);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const geometry = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.8,
        vertexColors: true,
      }),
    []
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    stones.forEach((stone, idx) => {
      tempObject.position.set(...stone.position);
      tempObject.rotation.set(...stone.rotation);
      tempObject.scale.setScalar(stone.scale);
      tempObject.updateMatrix();
      mesh.setMatrixAt(idx, tempObject.matrix);
      mesh.setColorAt(idx, tempColor.set(stone.color));
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [stones, tempColor, tempObject]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, stones.length]}
      castShadow
      receiveShadow
    />
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
      <Canvas
        shadows
        camera={{ position: [8, 6, 8], fov: 45 }}
        dpr={[1, 2]}
        frameloop={autoRotate ? 'always' : 'demand'}
      >
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
          <InstancedObstacles />
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
