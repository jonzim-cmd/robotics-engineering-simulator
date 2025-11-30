import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Grid, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// --- ROBOT COMPONENT ---
const Robot = ({ 
    mode, 
    isFixed 
}: { 
    mode: 'IDLE' | 'MOVE' | 'SPIN' | 'SHAKE' | 'PANIC',
    isFixed: boolean 
}) => {
  const group = useRef<THREE.Group>(null);
  const [targetRot, setTargetRot] = useState(0);
  
  useFrame((state, delta) => {
    if (!group.current) return;

    const time = state.clock.getElapsedTime();

    // If fixed, smooth movement around a circle
    if (isFixed) {
        // Smooth circular motion path
        group.current.position.x = Math.sin(time * 0.5) * 3;
        group.current.position.z = Math.cos(time * 0.5) * 2;
        // Face direction of movement
        group.current.rotation.y = Math.atan2(Math.cos(time * 0.5), -Math.sin(time * 0.5));
        
        // Reset tilt
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, delta * 5);
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, 0, delta * 5);
        return;
    }

    // Chaos modes - much slower and calmer
    switch (mode) {
      case 'MOVE':
        // Move forward and backward - much slower
        group.current.position.z = Math.sin(time * 0.8) * 0.7;
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, delta * 3);
        break;
      case 'SPIN':
        // Slower spin - robot is confused
        group.current.rotation.y += delta * 4;
        group.current.position.x = Math.sin(time * 1) * 0.1;
        break;
      case 'SHAKE':
        // Very gentle shaking - obstacle detected
        group.current.position.x = (Math.random() - 0.5) * 0.1;
        group.current.position.z = (Math.random() - 0.5) * 0.1;
        group.current.rotation.y += (Math.random() - 0.5) * 0.08;
        break;
      case 'PANIC':
        // Calmer panic - slow spin and gentle shake
        group.current.rotation.y += delta * 5;
        group.current.position.x = (Math.random() - 0.5) * 0.12;
        group.current.position.z = (Math.random() - 0.5) * 0.12;
        group.current.rotation.z = Math.sin(time * 3) * 0.06;
        break;
      case 'IDLE':
      default:
        // Very subtle idle
        group.current.position.y = Math.sin(time * 3) * 0.05;
        group.current.rotation.x = Math.sin(time * 1.5) * 0.03;
        break;
    }
  });

  return (
    <group ref={group} scale={1.5}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 0.6, 1]} />
        <meshStandardMaterial color={isFixed ? "#4ade80" : "#e2e8f0"} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Head */}
      <group position={[0, 0.9, 0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.3, 0.3]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.1, 0, 0.16]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color={isFixed ? "#22c55e" : "#06b6d4"} emissive={isFixed ? "#22c55e" : "#06b6d4"} emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.1, 0, 0.16]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color={isFixed ? "#22c55e" : "#06b6d4"} emissive={isFixed ? "#22c55e" : "#06b6d4"} emissiveIntensity={2} />
        </mesh>
      </group>

      {/* Wheels */}
      <mesh position={[0.45, 0.2, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#22c55e" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.45, 0.2, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#22c55e" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.45, 0.2, -0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#22c55e" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.45, 0.2, -0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#22c55e" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
};

// --- GHOST SENSORS ---
const GhostPoints = ({ isFixed }: { isFixed: boolean }) => {
  // When fixed, ghosts disappear!
  
  const count = 12; 
  const [points, setPoints] = useState(() => Array.from({ length: count }).map(() => ({
    position: [
      (Math.random() - 0.5) * 6,
      0.5,
      (Math.random() - 0.5) * 6
    ] as [number, number, number],
    visible: Math.random() > 0.5,
  })));

  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(0.25, 8, 8), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ef4444",
    transparent: true,
    opacity: 0.5,
    emissive: "#ef4444",
    emissiveIntensity: 2,
  }), []);

  useFrame((state) => {
    if (isFixed) {
        // No ghosts when fixed
        return;
    }
    
    setPoints(prev => prev.map(p => {
      if (Math.random() > 0.92) {
        return {
          ...p,
          visible: !p.visible,
          position: [(Math.random() - 0.5) * 6, 0.5 + Math.random() * 0.5, (Math.random() - 0.5) * 6]
        };
      }
      return p;
    }));
  });

  if (isFixed) return null;

  return (
    <group>
      {points.map((p, i) => (
        p.visible && (
          <mesh key={i} position={p.position} geometry={sphereGeometry} material={material} />
        )
      ))}
    </group>
  );
};

// --- SCENE CONTENT ---
const SceneContent = ({ isFixed }: { isFixed: boolean }) => {
    const [mode, setMode] = useState<'IDLE' | 'MOVE' | 'SPIN' | 'SHAKE' | 'PANIC'>('MOVE');

    useFrame((state) => {
        if (isFixed) return; // No chaos logic needed if fixed

        const t = state.clock.getElapsedTime();
        const cycle = t % 8;
        if (cycle < 1.5) setMode('MOVE');
        else if (cycle < 2.5) setMode('SHAKE'); 
        else if (cycle < 3.5) setMode('SPIN'); 
        else if (cycle < 5) setMode('PANIC'); 
        else if (cycle < 5.8) setMode('SHAKE'); 
        else if (cycle < 7) setMode('SPIN'); 
        else setMode('MOVE'); 
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <Robot mode={mode} isFixed={isFixed} />
            <GhostPoints isFixed={isFixed} />

            {/* Floor Grid */}
            <Grid args={[10, 10]} cellColor="#202020" sectionColor={isFixed ? "#22c55e" : "#06b6d4"} fadeDistance={20} infiniteGrid />

            <ContactShadows opacity={0.5} scale={10} blur={2} far={10} resolution={256} color="#000000" />
        </>
    );
}

// --- MAIN EXPORT ---
export default function CrazyRobotSceneWrapper({ isFixed = false }: { isFixed?: boolean }) {
  return (
    <div className={`w-full h-full bg-slate-950 rounded overflow-hidden border relative transition-colors duration-1000 ${isFixed ? 'border-green-500/50' : 'border-slate-800'}`}>
        <div className="absolute top-4 right-4 z-10 bg-black/50 px-2 py-1 rounded text-[10px] text-cyan-400 font-mono border border-cyan-900">
            CAM_04 [OVERHEAD VIEW]
        </div>
        
        {isFixed && (
            <div className="absolute top-4 left-4 z-10 bg-green-900/80 px-2 py-1 rounded text-[10px] text-green-300 font-mono border border-green-500 font-bold animate-pulse">
                SIGNAL CLEAR - NAVIGATION ACTIVE
            </div>
        )}

      <Canvas shadows camera={{ position: [0, 10, 0], fov: 50 }}>
        <PerspectiveCamera makeDefault position={[0, 12, 3]} rotation={[-Math.PI / 3, 0, 0]} />
        <SceneContent isFixed={isFixed} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}