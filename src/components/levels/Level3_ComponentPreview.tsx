import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

type ComponentType = 
  // Drives
  | 'wheels' | 'tracks' | 'legs' | 'mecanum' | 'hover'
  // Grippers
  | 'claw' | 'vacuum' | 'magnetic' | 'soft' | 'needle';

interface ComponentPreviewProps {
  type: ComponentType;
  className?: string;
}

const RotatingModel = ({ type }: { type: ComponentType }) => {
  const groupRef = useRef<THREE.Group>(null);
  const propellerRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
    if (propellerRef.current) {
       propellerRef.current.rotation.z += 0.2;
    }
  });

  // High Contrast Material Palette
  const mat = {
    metalBright: new THREE.MeshStandardMaterial({ color: '#f0f0f0', roughness: 0.2, metalness: 0.8 }), // Shiny Silver
    metalDark: new THREE.MeshStandardMaterial({ color: '#4a5568', roughness: 0.5, metalness: 0.5 }), // Gunmetal Grey
    rubber: new THREE.MeshStandardMaterial({ color: '#1a202c', roughness: 0.9, metalness: 0.1 }), // Almost Black
    accent: new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.3, metalness: 0.3 }), // Industrial Orange
    glow: new THREE.MeshStandardMaterial({ color: '#00ffff', emissive: '#00ffff', emissiveIntensity: 0.8 }),
    coil: new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4 }), // Bright Red
    soft: new THREE.MeshStandardMaterial({ color: '#3b82f6', transmission: 0.2, opacity: 0.7, transparent: true, roughness: 0.1 }), // Blue Glassy
    gold: new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 1, roughness: 0.1 }), // Gold
  };

  const renderModel = () => {
    switch (type) {
      // --- DRIVES ---
      case 'wheels':
        return (
          <group>
            {/* Main Tire - Dark */}
            <mesh rotation={[0, 0, Math.PI / 2]} material={mat.rubber}>
              <cylinderGeometry args={[1, 1, 0.8, 32]} />
            </mesh>
            {/* Rim - Bright Metal */}
            <mesh rotation={[0, 0, Math.PI / 2]} material={mat.metalBright}>
              <cylinderGeometry args={[0.65, 0.65, 0.85, 16]} />
            </mesh>
            {/* Hub Cap - Accent */}
            <mesh rotation={[0, 0, Math.PI / 2]} material={mat.metalDark}>
               <cylinderGeometry args={[0.2, 0.2, 0.9, 16]} />
            </mesh>
            {/* Bolts - Contrast */}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <mesh key={deg} position={[0.45 * Math.cos(deg * Math.PI/180), 0.45 * Math.sin(deg * Math.PI/180), 0.43]} rotation={[0, 0, Math.PI/2]} material={mat.gold}>
                 <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
              </mesh>
            ))}
          </group>
        );
      case 'tracks':
        return (
          <group>
            {/* Top Flat Part */}
            <mesh position={[0, 0.5, 0]} material={mat.rubber}>
               <boxGeometry args={[1.6, 0.1, 1]} />
            </mesh>
            {/* Bottom Flat Part */}
            <mesh position={[0, -0.5, 0]} material={mat.rubber}>
               <boxGeometry args={[1.6, 0.1, 1]} />
            </mesh>
            {/* Front Curve */}
            <mesh position={[-0.8, 0, 0]} rotation={[Math.PI/2, 0, 0]} material={mat.rubber}>
               <cylinderGeometry args={[0.45, 0.45, 1, 32, 1, false]} />
            </mesh>
            {/* Rear Curve */}
            <mesh position={[0.8, 0, 0]} rotation={[Math.PI/2, 0, 0]} material={mat.rubber}>
               <cylinderGeometry args={[0.45, 0.45, 1, 32, 1, false]} />
            </mesh>

            {/* Drive Sprocket - Front (Orange) */}
            <mesh position={[-0.8, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat.accent}>
               <cylinderGeometry args={[0.35, 0.35, 1.05, 16]} />
            </mesh>
            {/* Sprocket Teeth Detail */}
             {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
               <mesh key={deg} position={[-0.8 + 0.4*Math.cos(deg*Math.PI/180), 0.4*Math.sin(deg*Math.PI/180), 0]} rotation={[0, 0, deg*Math.PI/180]} material={mat.accent}>
                  <boxGeometry args={[0.1, 0.1, 1.06]} />
               </mesh>
             ))}

             {/* Idler Wheel - Rear (Bright Metal) */}
             <mesh position={[0.8, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat.metalBright}>
               <cylinderGeometry args={[0.35, 0.35, 1.05, 32]} />
            </mesh>

            {/* Road Wheels - Middle (Dark Metal) */}
            <mesh position={[-0.25, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat.metalDark}>
               <cylinderGeometry args={[0.2, 0.2, 1.05, 16]} />
            </mesh>
            <mesh position={[0.25, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat.metalDark}>
               <cylinderGeometry args={[0.2, 0.2, 1.05, 16]} />
            </mesh>

            {/* Pronounced Treads */}
            {[...Array(12)].map((_, i) => {
               const treadX = -0.7 + i * 0.2; // Adjusted distribution for new length
               return (
                  <group key={i}>
                     <mesh position={[treadX, 0.5, 0]} material={mat.metalDark}>
                        <boxGeometry args={[0.05, 0.05, 1.02]} />
                     </mesh>
                     <mesh position={[treadX, -0.5, 0]} material={mat.metalDark}>
                        <boxGeometry args={[0.05, 0.05, 1.02]} />
                     </mesh>
                  </group>
               )
            })}
          </group>
        );
      case 'legs':
        return (
          <group position={[0, -0.5, 0]}>
             {/* Hip Joint - Accent */}
             <mesh position={[0, 1, 0]} material={mat.accent}>
                <sphereGeometry args={[0.4]} />
             </mesh>
             {/* Upper Leg - Dark Metal */}
             <mesh position={[0.5, 0.8, 0]} rotation={[0, 0, -Math.PI/4]} material={mat.metalDark}>
                <boxGeometry args={[1.5, 0.3, 0.3]} />
             </mesh>
             {/* Piston Detail on Upper Leg */}
             <mesh position={[0.5, 1, 0]} rotation={[0, 0, -Math.PI/4]} material={mat.metalBright}>
                <cylinderGeometry args={[0.05, 0.05, 1]} />
             </mesh>

             {/* Knee Joint - Bright Metal */}
             <mesh position={[1.1, 0.2, 0]} material={mat.metalBright}>
                <sphereGeometry args={[0.35]} />
             </mesh>
             
             {/* Lower Leg - Dark Metal */}
             <mesh position={[1.1, -0.6, 0]} rotation={[0, 0, 0]} material={mat.metalDark}>
                <boxGeometry args={[0.25, 1.8, 0.25]} />
             </mesh>
             {/* Foot - Rubber */}
             <mesh position={[1.1, -1.5, 0]} material={mat.rubber}>
                <sphereGeometry args={[0.25]} />
             </mesh>
          </group>
        );
      case 'mecanum':
        return (
          <group>
             {/* Hub - Bright Metal */}
            <mesh rotation={[0, 0, Math.PI / 2]} material={mat.metalBright}>
              <cylinderGeometry args={[0.6, 0.6, 0.75, 32]} />
            </mesh>
            {/* Side Plates - Dark */}
            <mesh position={[0, 0, 0.38]} rotation={[0, 0, Math.PI / 2]} material={mat.metalDark}>
               <cylinderGeometry args={[0.9, 0.9, 0.05, 32]} />
            </mesh>
            <mesh position={[0, 0, -0.38]} rotation={[0, 0, Math.PI / 2]} material={mat.metalDark}>
               <cylinderGeometry args={[0.9, 0.9, 0.05, 32]} />
            </mesh>

            {/* Angled Rollers - Rubber with separation */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
               <mesh key={i} 
                  position={[0.9 * Math.cos(deg * Math.PI/180), 0.9 * Math.sin(deg * Math.PI/180), 0]}
                  rotation={[Math.PI/4, 0, (deg + 90) * Math.PI/180]}
                  material={mat.rubber}
               >
                  <capsuleGeometry args={[0.15, 0.4, 4, 8]} />
               </mesh>
            ))}
          </group>
        );
      case 'hover':
        return (
          <group>
             {/* Ring Housing - Dark Metal */}
             <mesh rotation={[Math.PI/2, 0, 0]} material={mat.metalDark}>
                <torusGeometry args={[1, 0.15, 16, 32]} />
             </mesh>
             {/* Inner Struts - Accent */}
             <mesh rotation={[Math.PI/2, 0, 0]} material={mat.accent}>
                <cylinderGeometry args={[0.1, 0.1, 2]} />
             </mesh>
             
             {/* Spinning Propeller */}
             <group ref={propellerRef} rotation={[Math.PI/2, 0, 0]}>
                <mesh material={mat.metalBright}>
                   <boxGeometry args={[1.8, 0.15, 0.02]} />
                </mesh>
                <mesh rotation={[0, 0, Math.PI/2]} material={mat.metalBright}>
                   <boxGeometry args={[1.8, 0.15, 0.02]} />
                </mesh>
             </group>
             
             {/* Glow Effect */}
             <pointLight color="#00ffff" intensity={3} distance={2} />
             <mesh position={[0, -0.2, 0]} rotation={[Math.PI/2, 0, 0]} material={mat.glow}>
                <circleGeometry args={[0.8, 32]} />
             </mesh>
          </group>
        );

      // --- GRIPPERS ---
      case 'claw':
        return (
           <group>
              {/* Wrist - Dark */}
              <mesh position={[0, -0.6, 0]} material={mat.metalDark}>
                 <cylinderGeometry args={[0.3, 0.4, 0.4]} />
              </mesh>
              {/* Joint - Accent */}
              <mesh position={[0, -0.3, 0]} rotation={[0, 0, Math.PI/2]} material={mat.accent}>
                 <cylinderGeometry args={[0.15, 0.15, 1]} />
              </mesh>

              {/* Left Finger - Bright Metal */}
              <mesh position={[-0.35, 0.3, 0]} rotation={[0, 0, 0.2]} material={mat.metalBright}>
                 <boxGeometry args={[0.15, 1.1, 0.4]} />
              </mesh>
              {/* Left Pad - Rubber */}
              <mesh position={[-0.25, 0.3, 0]} rotation={[0, 0, 0.2]} material={mat.rubber}>
                 <boxGeometry args={[0.05, 0.9, 0.35]} />
              </mesh>

               {/* Right Finger - Bright Metal */}
              <mesh position={[0.35, 0.3, 0]} rotation={[0, 0, -0.2]} material={mat.metalBright}>
                 <boxGeometry args={[0.15, 1.1, 0.4]} />
              </mesh>
              {/* Right Pad - Rubber */}
              <mesh position={[0.25, 0.3, 0]} rotation={[0, 0, -0.2]} material={mat.rubber}>
                 <boxGeometry args={[0.05, 0.9, 0.35]} />
              </mesh>
           </group>
        );
      case 'vacuum':
         return (
            <group>
               {/* Stem/Pipe - Metal */}
               <mesh position={[0, 0.5, 0]} material={mat.metalBright}>
                  <cylinderGeometry args={[0.15, 0.15, 1]} />
               </mesh>
               {/* Connector - Accent */}
               <mesh position={[0, 0, 0]} material={mat.accent}>
                  <cylinderGeometry args={[0.25, 0.2, 0.2]} />
               </mesh>
               {/* Cup - Distinct Blueish Rubber */}
               <mesh position={[0, -0.3, 0]} material={new THREE.MeshStandardMaterial({ color: '#334455', roughness: 0.4 })}>
                  <cylinderGeometry args={[0.6, 0.15, 0.6, 32]} />
               </mesh>
               {/* Inner Void simulation */}
               <mesh position={[0, -0.61, 0]} rotation={[Math.PI/2, 0, 0]} material={new THREE.MeshBasicMaterial({ color: '#000' })}>
                  <circleGeometry args={[0.5, 32]} />
               </mesh>
            </group>
         );
      case 'magnetic':
         return (
            <group>
               {/* Main Magnet Body - Dark Metal */}
               <mesh material={mat.metalDark}>
                  <cylinderGeometry args={[0.6, 0.6, 0.5, 32]} />
               </mesh>
               {/* Top Hook - Bright */}
               <mesh position={[0, 0.4, 0]} material={mat.metalBright}>
                  <torusGeometry args={[0.2, 0.05, 16, 32]} />
               </mesh>
               
               {/* Coils - Bright Red */}
               <mesh position={[0, 0, 0]} material={mat.coil}>
                  <torusGeometry args={[0.62, 0.08, 16, 32]} />
               </mesh>
               <mesh position={[0, 0.15, 0]} material={mat.coil}>
                  <torusGeometry args={[0.62, 0.08, 16, 32]} />
               </mesh>
               <mesh position={[0, -0.15, 0]} material={mat.coil}>
                  <torusGeometry args={[0.62, 0.08, 16, 32]} />
               </mesh>
               
               {/* Contact Plate - Gold/Copper */}
               <mesh position={[0, -0.26, 0]} material={mat.gold}>
                  <cylinderGeometry args={[0.55, 0.55, 0.02, 32]} />
               </mesh>
            </group>
         );
      case 'soft':
         return (
            <group>
               {/* Base - Dark */}
               <mesh position={[0, -0.5, 0]} material={mat.metalDark}>
                  <cylinderGeometry args={[0.3, 0.3, 0.2]} />
               </mesh>
               {/* Actuator Ring - Accent */}
               <mesh position={[0, -0.35, 0]} material={mat.accent}>
                  <cylinderGeometry args={[0.35, 0.35, 0.1]} />
               </mesh>
               
               {/* Soft Fingers */}
               {[0, 120, 240].map((deg) => (
                  <group key={deg} rotation={[0, deg * Math.PI/180, 0]}>
                     <mesh position={[0.35, 0.1, 0]} rotation={[0, 0, -0.3]} material={mat.soft}>
                        <capsuleGeometry args={[0.12, 0.9, 8, 16]} />
                     </mesh>
                     {/* Internal Skeleton visible through transparency */}
                     <mesh position={[0.35, 0.1, 0]} rotation={[0, 0, -0.3]} material={new THREE.MeshBasicMaterial({ color: '#fff' })}>
                        <capsuleGeometry args={[0.02, 0.8, 4, 8]} />
                     </mesh>
                  </group>
               ))}
            </group>
         );
      case 'needle':
         return (
            <group>
               {/* Mounting Plate - Dark */}
               <mesh position={[0, 0.2, 0]} material={mat.metalDark}>
                  <boxGeometry args={[1, 0.1, 1]} />
               </mesh>
               {/* Base Plate - Accent */}
               <mesh material={mat.accent}>
                  <boxGeometry args={[1, 0.2, 1]} />
               </mesh>
               {/* Needles - Gold */}
               {Array.from({ length: 25 }).map((_, i) => {
                  const x = (i % 5) * 0.2 - 0.4;
                  const z = Math.floor(i / 5) * 0.2 - 0.4;
                  return (
                     <mesh key={i} position={[x, -0.3, z]} rotation={[Math.PI, 0, 0]} material={mat.gold}>
                        <coneGeometry args={[0.03, 0.4, 8]} />
                     </mesh>
                  )
               })}
            </group>
         );
      default:
        return <mesh><boxGeometry /></mesh>;
    }
  };

  return (
    <group ref={groupRef}>
      {renderModel()}
    </group>
  );
};

export const Level3_ComponentPreview: React.FC<ComponentPreviewProps> = ({ type, className }) => {
  return (
    <div className={className}>
      <Canvas dpr={[1, 2]}>
        <color attach="background" args={['#e2e8f0']} /> {/* Light Slate-200 background for better contrast */}
        
        <PerspectiveCamera makeDefault position={[2.5, 2, 2.5]} fov={40} />
        
        {/* Lighting Setup for optimal shape definition */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-5, 2, -2]} intensity={0.5} color="#b0c4de" /> {/* Rim/Fill Light (cool tone) */}
        
        <RotatingModel type={type} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
};