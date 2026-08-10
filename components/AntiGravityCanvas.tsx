'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Text, PerspectiveCamera, Environment, Center } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider, RapierRigidBody, vec3 } from '@react-three/rapier';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Floating 3D Primitive Item Definition ────────────────────────────────────

interface FloatingBodyProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  geometryType: 'icosahedron' | 'octahedron' | 'torusKnot' | 'panelCube' | 'card';
  color: string;
  label?: string;
  driftPhase: number;
  gravityActive: boolean;
}

function FloatingBody({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  geometryType,
  color,
  label,
  driftPhase,
  gravityActive,
}: FloatingBodyProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const initialPos = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state) => {
    if (!rigidBodyRef.current) return;

    const t = state.clock.getElapsedTime() + driftPhase;
    const bodyPos = rigidBodyRef.current.translation();

    // 1. Weightlessness Drifting (Sine/Cosine Waves)
    if (!gravityActive) {
      const driftX = Math.sin(t * 0.8 + driftPhase) * 0.008;
      const driftY = Math.cos(t * 0.6 + driftPhase * 1.5) * 0.012;
      const driftZ = Math.sin(t * 0.5 + driftPhase * 2) * 0.006;

      rigidBodyRef.current.applyImpulse({ x: driftX, y: driftY, z: driftZ }, true);

      // Continuous subtle 3D rotational torque
      rigidBodyRef.current.applyTorqueImpulse(
        {
          x: Math.sin(t * 0.3) * 0.001,
          y: Math.cos(t * 0.4) * 0.001,
          z: Math.sin(t * 0.2) * 0.001,
        },
        true
      );
    }

    // 2. Cursor Repulsion Force
    const mouse3D = new THREE.Vector3(
      (state.pointer.x * state.viewport.width) / 2,
      (state.pointer.y * state.viewport.height) / 2,
      0
    );

    const objPos = new THREE.Vector3(bodyPos.x, bodyPos.y, bodyPos.z);
    const distToMouse = objPos.distanceTo(mouse3D);
    const repulsionRadius = 3.5;

    if (distToMouse < repulsionRadius) {
      const forceDirection = objPos.clone().sub(mouse3D).normalize();
      const forceMagnitude = (1 - distToMouse / repulsionRadius) * 0.08;

      rigidBodyRef.current.applyImpulse(
        {
          x: forceDirection.x * forceMagnitude,
          y: forceDirection.y * forceMagnitude,
          z: forceDirection.z * forceMagnitude * 0.5,
        },
        true
      );

      // Slow 3D torque spin when mouse repels
      rigidBodyRef.current.applyTorqueImpulse(
        {
          x: (Math.random() - 0.5) * 0.005,
          y: (Math.random() - 0.5) * 0.008,
          z: (Math.random() - 0.5) * 0.005,
        },
        true
      );
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      rotation={rotation}
      restitution={0.35}
      linearDamping={0.7}
      angularDamping={0.6}
      colliders="hull"
    >
      <group
        scale={scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Render geometry based on type */}
        {geometryType === 'icosahedron' && (
          <mesh ref={meshRef}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={hovered ? '#facc15' : color}
              roughness={0.15}
              metalness={0.8}
              envMapIntensity={1.5}
            />
          </mesh>
        )}

        {geometryType === 'octahedron' && (
          <mesh ref={meshRef}>
            <octahedronGeometry args={[1.1]} />
            <MeshTransmissionMaterial
              backside
              samples={4}
              thickness={0.5}
              chromaticAberration={0.06}
              anisotropy={0.1}
              distortion={0.2}
              distortionScale={0.3}
              temporalDistortion={0.5}
              color={hovered ? '#fbbf24' : color}
            />
          </mesh>
        )}

        {geometryType === 'torusKnot' && (
          <mesh ref={meshRef}>
            <torusKnotGeometry args={[0.8, 0.25, 128, 32]} />
            <meshStandardMaterial
              color={hovered ? '#38bdf8' : color}
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
        )}

        {geometryType === 'panelCube' && (
          <group>
            {/* Silicon Solar Panel Card 3D Cube */}
            <mesh ref={meshRef}>
              <boxGeometry args={[2.2, 1.4, 0.15]} />
              <meshStandardMaterial
                color={hovered ? '#0284c7' : '#0f172a'}
                roughness={0.2}
                metalness={0.7}
              />
            </mesh>
            {/* Solar Cell Grid Lines */}
            <mesh position={[0, 0, 0.08]}>
              <planeGeometry args={[2.1, 1.3]} />
              <meshBasicMaterial color="#38bdf8" wireframe />
            </mesh>
          </group>
        )}

        {geometryType === 'card' && (
          <group>
            <mesh ref={meshRef}>
              <boxGeometry args={[2.5, 1.5, 0.1]} />
              <meshStandardMaterial
                color="#18181b"
                roughness={0.3}
                metalness={0.4}
              />
            </mesh>
            {label && (
              <Text
                position={[0, 0, 0.07]}
                fontSize={0.28}
                color={hovered ? '#facc15' : '#f4f4f5'}
                anchorX="center"
                anchorY="middle"
                font="/fonts/Inter-Bold.ttf"
              >
                {label}
              </Text>
            )}
          </group>
        )}
      </group>
    </RigidBody>
  );
}

// ─── Scene Lighting & Invisible Boundary Walls ───────────────────────────────

function SceneBoundaries() {
  return (
    <group>
      {/* Invisible Colliders to enclose physics floating chamber */}
      <CuboidCollider position={[0, -8, 0]} args={[15, 0.5, 10]} restitution={0.3} />
      <CuboidCollider position={[0, 8, 0]} args={[15, 0.5, 10]} restitution={0.3} />
      <CuboidCollider position={[-12, 0, 0]} args={[0.5, 10, 10]} restitution={0.3} />
      <CuboidCollider position={[12, 0, 0]} args={[0.5, 10, 10]} restitution={0.3} />
      <CuboidCollider position={[0, 0, -8]} args={[15, 10, 0.5]} restitution={0.3} />
      <CuboidCollider position={[0, 0, 8]} args={[15, 10, 0.5]} restitution={0.3} />
    </group>
  );
}

// ─── Anti-Gravity 3D Physics Canvas Component ───────────────────────────────

interface AntiGravityCanvasProps {
  className?: string;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function AntiGravityCanvas({ className = '', scrollContainerRef }: AntiGravityCanvasProps) {
  const [gravityVector, setGravityVector] = useState<[number, number, number]>([0, 0, 0]);
  const [isZeroG, setIsZeroG] = useState(true);

  // GSAP ScrollTrigger to flip gravity when scrolling down
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: typeof window !== 'undefined' ? document.body : null,
      start: 'top top',
      end: '+=400',
      onUpdate: (self) => {
        const progress = self.progress;
        if (progress > 0.25) {
          // Activate downward gravity as user scrolls down
          setGravityVector([0, -9.81 * Math.min(1, (progress - 0.25) * 2), 0]);
          setIsZeroG(false);
        } else {
          // Zero-G vacuum floating state
          setGravityVector([0, 0, 0]);
          setIsZeroG(true);
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  // Floating objects dataset with Z-depth variation for parallax
  const floatingItems: FloatingBodyProps[] = [
    {
      position: [-3.5, 2.0, 1.5], // Foreground (Z = +1.5)
      geometryType: 'panelCube',
      color: '#0284c7',
      scale: 1.1,
      driftPhase: 0,
      gravityActive: !isZeroG,
    },
    {
      position: [3.8, 1.5, 0.8],
      geometryType: 'card',
      color: '#18181b',
      label: '⚡ 98.4% ML Yield',
      scale: 1.0,
      driftPhase: 1.2,
      gravityActive: !isZeroG,
    },
    {
      position: [-1.8, -1.8, 2.2], // Foreground (Z = +2.2)
      geometryType: 'panelCube',
      color: '#facc15',
      scale: 0.9,
      driftPhase: 2.4,
      gravityActive: !isZeroG,
    },
    {
      position: [2.2, -2.2, -1.5], // Background (Z = -1.5)
      geometryType: 'octahedron',
      color: '#38bdf8',
      scale: 1.3,
      driftPhase: 3.6,
      gravityActive: !isZeroG,
    },
    {
      position: [0, 2.5, -2.0], // Background (Z = -2.0)
      geometryType: 'torusKnot',
      color: '#e0f2fe',
      scale: 0.85,
      driftPhase: 4.8,
      gravityActive: !isZeroG,
    },
    {
      position: [-4.2, -1.2, -0.5],
      geometryType: 'card',
      color: '#18181b',
      label: '☀️ 1,420 kWh/kWp',
      scale: 0.95,
      driftPhase: 5.5,
      gravityActive: !isZeroG,
    },
    {
      position: [4.5, -0.5, 1.2],
      geometryType: 'card',
      color: '#18181b',
      label: '💰 ₹12.5L 25Y ROI',
      scale: 1.05,
      driftPhase: 6.1,
      gravityActive: !isZeroG,
    },
  ];

  return (
    <div className={`relative w-full h-[520px] sm:h-[620px] rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800/80 shadow-2xl ${className}`}>
      {/* Zero-G UI Status Indicator Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700 text-xs font-mono backdrop-blur-md">
        <span className={`w-2 h-2 rounded-full ${isZeroG ? 'bg-amber-400 animate-ping' : 'bg-sky-400'}`} />
        <span className="text-zinc-200">
          PHYSICS: <strong className={isZeroG ? 'text-amber-400' : 'text-sky-400'}>{isZeroG ? 'ZERO-GRAVITY (FLOAT)' : 'EARTH GRAVITY (9.8m/s²)'}</strong>
        </span>
      </div>

      <div className="absolute top-4 right-4 z-20 text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
        🖱️ Mouse Repulsion • 🌀 Soft Collisions
      </div>

      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={50} />

        {/* Ambient & Key Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#fff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#38bdf8" />
        <pointLight position={[0, 0, 3]} intensity={0.8} color="#facc15" />

        {/* Environment map for realistic glass/metallic reflections */}
        <Environment preset="city" />

        <Physics gravity={gravityVector} timeStep="vary">
          <SceneBoundaries />

          {floatingItems.map((item, index) => (
            <FloatingBody key={index} {...item} />
          ))}
        </Physics>
      </Canvas>
    </div>
  );
}
