import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Grid, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// --- ROBOT COMPONENT ---
const Robot = ({ mode }: { mode: 'IDLE' | 'MOVE' | 'SPIN' | 'SHAKE' | 'PANIC' }) => {
  const group = useRef<THREE.Group>(null);
  const [targetRot, setTargetRot] = useState(0);
  
  useFrame((state, delta) => {
    if (!group.current) return;

    // Base movement
    const time = state.clock.getElapsedTime();

    switch (mode) {
      case 'MOVE':
        // Move forward and backward
        group.current.position.z = Math.sin(time * 2) * 1.2;
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, delta * 5);
        break;
      case 'SPIN':
        // Fast spin - robot is confused!
        group.current.rotation.y += delta * 15;
        group.current.position.x = Math.sin(time * 3) * 0.2;
        break;
      case 'SHAKE':
        // Controlled shaking - obstacle detected!
        group.current.position.x = (Math.random() - 0.5) * 0.3;
        group.current.position.z = (Math.random() - 0.5) * 0.3;
        group.current.rotation.y += (Math.random() - 0.5) * 0.2;
        break;
      case 'PANIC':
        // Chaotic movement - spin and shake!
        group.current.rotation.y += delta * 20;
        group.current.position.x = (Math.random() - 0.5) * 0.4;
        group.current.position.z = (Math.random() - 0.5) * 0.4;
        group.current.rotation.z = Math.sin(time * 8) * 0.15;
        break;
      case 'IDLE':
      default:
        // Nervous idle - subtle shaking
        group.current.position.y = Math.sin(time * 4) * 0.08;
        group.current.rotation.x = Math.sin(time * 2) * 0.05;
        break;
    }
  });

  return (
    <group ref={group} scale={1.5}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 0.6, 1]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.8} />
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
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.1, 0, 0.16]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
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
// Optimize with useMemo for geometries and materials
const GhostPoints = () => {
  // Generate random points that flicker - these are the "ghost obstacles"
  const count = 12; // Reduced from 15 for better performance
  const [points, setPoints] = useState(() => Array.from({ length: count }).map(() => ({
    position: [
      (Math.random() - 0.5) * 6,
      0.5,
      (Math.random() - 0.5) * 6
    ] as [number, number, number],
    visible: Math.random() > 0.5,
    timer: Math.random() * 100
  })));

  // Reuse geometry and material for performance
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(0.25, 12, 12), []); // Reduced segments from 16
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ef4444",
    transparent: true,
    opacity: 0.7,
    emissive: "#ef4444",
    emissiveIntensity: 2.5,
  }), []);

  useFrame((state) => {
    setPoints(prev => prev.map(p => {
      // More frequent toggling - ghost sensors flickering wildly!
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

// --- PANICKING WORKERS ---
const PanickingWorker = ({ position }: { position: [number, number, number] }) => {
  const group = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []); // Random phase offset

  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.getElapsedTime();

    // Wave arms frantically
    const armSpeed = 8;
    group.current.rotation.z = Math.sin(time * armSpeed + offset) * 0.3;
  });

  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.4, 0.8, 0.3]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>

      {/* Arms - waving frantically */}
      <group ref={group}>
        <mesh position={[-0.3, 0.7, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.5, 0.1, 0.1]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <mesh position={[0.3, 0.7, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.5, 0.1, 0.1]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[-0.15, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.4, 0.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0.15, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.4, 0.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
};

// --- MAIN SCENE ---
export const CrazyRobotScene: React.FC = () => {
  const [mode, setMode] = useState<'IDLE' | 'MOVE' | 'SPIN' | 'SHAKE' | 'PANIC'>('IDLE');

  // Chaos logic
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Switch modes randomly every few seconds
    if (Math.floor(time) % 3 === 0 && Math.random() > 0.9) {
        const modes = ['MOVE', 'SPIN', 'SHAKE', 'PANIC'] as const;
        setMode(modes[Math.floor(Math.random() * modes.length)]);
    }
  });

  // Wrapper to allow useFrame inside Canvas, we need a component inside Canvas for logic
  return null;
};

const SceneContent = () => {
    const [mode, setMode] = useState<'IDLE' | 'MOVE' | 'SPIN' | 'SHAKE' | 'PANIC'>('MOVE');

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Chaotic state machine - robot constantly switches between erratic behaviors
        const cycle = t % 8;
        if (cycle < 1.5) setMode('MOVE');
        else if (cycle < 2.5) setMode('SHAKE'); // Sudden obstacle detected!
        else if (cycle < 3.5) setMode('SPIN'); // Confusion/trying to find path
        else if (cycle < 5) setMode('PANIC'); // Total panic!
        else if (cycle < 5.8) setMode('SHAKE'); // More phantom obstacles
        else if (cycle < 7) setMode('SPIN'); // More confusion
        else setMode('MOVE'); // Brief attempt to move normally
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <Robot mode={mode} />
            <GhostPoints />

            {/* Panicking workers in background */}
            <PanickingWorker position={[-4, 0, -3]} />
            <PanickingWorker position={[4.5, 0, -2.5]} />
            <PanickingWorker position={[-3.5, 0, 3]} />

            {/* Floor Grid */}
            <Grid args={[10, 10]} cellColor="#202020" sectionColor="#06b6d4" fadeDistance={20} infiniteGrid />

            <ContactShadows opacity={0.5} scale={10} blur={2} far={10} resolution={256} color="#000000" />
        </>
    );
}

export default function CrazyRobotSceneWrapper() {
  return (
    <div className="w-full h-full bg-slate-950 rounded overflow-hidden border border-slate-800 relative">
        <div className="absolute top-4 right-4 z-10 bg-black/50 px-2 py-1 rounded text-[10px] text-cyan-400 font-mono border border-cyan-900">
            CAM_04 [OVERHEAD VIEW]
        </div>
      <Canvas shadows camera={{ position: [0, 10, 0], fov: 50 }}>
        {/* Top-down view to see robot behavior clearly */}
        <PerspectiveCamera makeDefault position={[0, 12, 3]} rotation={[-Math.PI / 3, 0, 0]} />
        <SceneContent />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
