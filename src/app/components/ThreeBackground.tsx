'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

function Crystal({ theme }: { theme: 'individual' | 'bond' }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.2;
            meshRef.current.rotation.y += delta * 0.3;
        }
    });

    const color = theme === 'individual' ? '#3b82f6' : '#f97316';
    const emissive = theme === 'individual' ? '#1d4ed8' : '#c2410c';

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh
                ref={meshRef}
                scale={hovered ? 2.2 : 2}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <octahedronGeometry args={[1, 0]} />
                <meshPhysicalMaterial
                    color={color}
                    emissive={emissive}
                    emissiveIntensity={0.5}
                    roughness={0}
                    metalness={0.8}
                    clearcoat={1}
                    clearcoatRoughness={0}
                    transmission={0.2}
                    opacity={0.9}
                    transparent
                />
            </mesh>
        </Float>
    );
}

export default function ThreeBackground() {
    const { theme } = useTheme();

    return (
        <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8] }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={1} />

                <Crystal theme={theme} />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            </Canvas>
        </div>
    );
}
