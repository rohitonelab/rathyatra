import React, { useRef, useMemo, useEffect, useState, Component, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useTexture, useGLTF, OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { pullState, audioManager } from '../store';

const RATH_MODEL_URL = '/models/jagannath-rath.glb';
const MODEL_SCALE = 4.2;
// Ground plane in RathScene sits at world y = -1.2; the chariot group's floor
// (local y = 0, after the liftY correction below) should rest exactly on it.
const GROUND_Y = -1.2;
// Pushed further from the camera than the model's own depth so the full chariot,
// including its tiered canopy, stays inside frame instead of being cropped.
const GROUP_Z = -18;
// The source model's "front" (the wide, multi-wheel elevation) was facing sideways
// relative to the camera/rope axis. Rotate it 90° so the narrow front elevation
// faces the viewer and the rope, matching the real Rath Yatra pulling angle.
const MODEL_ROTATION_Y = Math.PI / 2;
useGLTF.preload(RATH_MODEL_URL);

function isWebGLAvailable(): boolean {
    try {
        const canvas = document.createElement('canvas');
        return !!(
            window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
    } catch {
        return false;
    }
}

function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(mql.matches);
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);
    return reduced;
}

class SceneErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch() {
        // Swallow -- the fallback already conveys the sacred atmosphere without WebGL.
    }
    render() {
        return this.state.hasError ? this.props.fallback : this.props.children;
    }
}

function ChariotFallback() {
    return (
        <div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#FFD54A] via-[#FFC107] to-[#F57C00]"
            data-testid="fallback-rath-scene"
        >
            <div className="text-center px-8">
                <div className="w-28 h-28 mx-auto mb-6 rounded-full border-4 border-[#FFD700] bg-gradient-to-br from-[#FFFDF7]/40 to-transparent shadow-[0_0_60px_rgba(255,215,0,0.5)]" />
                <p className="font-serif text-2xl text-[#4E342E]">नंदीघोष, पवित्र रथ</p>
                <p className="font-sans text-sm text-[#4E342E]/70 mt-2 tracking-wide">
                    आपका ब्राउज़र इंटरैक्टिव 3D रथ प्रदर्शित नहीं कर सकता, लेकिन तीर्थयात्रा नीचे जारी है।
                </p>
            </div>
        </div>
    );
}

function RathModel() {
    const groupRef = useRef<THREE.Group>(null);
    const ropeRef = useRef<THREE.Mesh>(null);
    const wheelBounceRef = useRef(0);

    const { scene } = useGLTF(RATH_MODEL_URL);
    const { object: rathScene, liftY, frontZ, wheelY } = useMemo(() => {
        const cloned = scene.clone(true);
        cloned.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
                const mesh = obj as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });
        // Rotate to face the camera/rope before measuring, so the bounding box below
        // reflects the corrected orientation (front/back and left/right swap).
        cloned.rotation.y = MODEL_ROTATION_Y;
        cloned.updateMatrixWorld(true);
        // The source model's origin is at its geometric center, not its feet, which
        // was sinking the chariot into the ground plane. Measure its bounding box and
        // lift it so the lowest point sits exactly at local y=0 (the group's floor).
        const box = new THREE.Box3().setFromObject(cloned);
        const lift = -box.min.y * MODEL_SCALE;
        const height = (box.max.y - box.min.y) * MODEL_SCALE;
        return {
            object: cloned,
            liftY: lift,
            // Front-facing edge of the chariot body (+z faces the camera/rope), so the
            // rope can be anchored directly onto it instead of floating in open air.
            frontZ: box.max.z * MODEL_SCALE,
            // Roughly wheel/axle height -- low on the body, near the ground, not mid-torso.
            wheelY: height * 0.12,
        };
    }, [scene]);

    // Using placeholders if generation missed. The app won't crash if they 404, texture will just be black/default.
    const [rope] = useTexture(['/textures/rope.jpg']);
    rope.wrapS = rope.wrapT = THREE.RepeatWrapping;
    rope.repeat.set(1, 22);

    // Rope spans from the chariot's front edge out toward the viewer/drag zone.
    // It has to reach further now that the chariot itself sits further back.
    const ropeLength = 31;
    const ropeNearZ = frontZ + ropeLength;
    const ropeCenterZ = (frontZ + ropeNearZ) / 2;

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        
        // Decay pull progress if not dragging and not success
        if (!pullState.success && pullState.progress > 0 && pullState.velocity === 0) {
            pullState.progress = Math.max(0, pullState.progress - 0.2);
            pullState.notify();
        }

        const p = pullState.progress;
        // Target is relative to the chariot's resting distance (GROUP_Z), not the
        // world origin -- otherwise the chariot drifts all the way to z=0..6 on every
        // frame regardless of how far back it's placed.
        const targetZ = GROUP_Z + (p / 100) * 6; // Move up to 6 units closer as it's pulled
        
        // Springy easing
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05);

        // Subtle wheel-roll illusion (the merged chariot mesh has no separate wheel
        // parts to spin, so we fake the "rolling" feel with a gentle rocking motion).
        const pulling = pullState.velocity > 0.1;
        wheelBounceRef.current += delta * (pulling ? 10 : 2);
        groupRef.current.rotation.x = Math.sin(wheelBounceRef.current) * (pulling ? 0.015 : 0.004);

        // Pulling effect on rope texture -- slides the weave as devotees pull.
        if (ropeRef.current) {
            const mat = ropeRef.current.material as THREE.MeshStandardMaterial;
            if (mat.map) {
                mat.map.offset.y -= pullState.velocity * 0.005;
            }
        }

        // Update audio context continuously in 3D frame
        audioManager.update();
    });

    return (
        <group ref={groupRef} position={[0, GROUND_Y, GROUP_Z]}>
            {/* Imported Jagannath Rath chariot model, lifted so its base rests on the ground */}
            <primitive object={rathScene} scale={MODEL_SCALE} position={[0, liftY, 0]} />

            {/* The Pulling Rope -- anchored directly onto the chariot's front edge at
                roughly wheel/axle height, then stretched out toward the viewer's drag zone. */}
            <mesh position={[0, wheelY, ropeCenterZ]} rotation={[Math.PI / 2, 0, 0]} ref={ropeRef} castShadow>
                <cylinderGeometry args={[0.15, 0.15, ropeLength, 16]} />
                <meshStandardMaterial map={rope} color="#d4a373" />
            </mesh>
        </group>
    );
}

function Petals({ reduced = false }: { reduced?: boolean }) {
    const petalTex = useTexture('/textures/petal.png');
    const count = reduced ? 40 : 150;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            x: (Math.random() - 0.5) * 20,
            y: Math.random() * 15 + 5,
            z: (Math.random() - 0.5) * 20,
            speed: Math.random() * 0.04 + 0.01,
            rx: Math.random() * Math.PI,
            ry: Math.random() * Math.PI,
            rs: Math.random() * 0.02,
            scale: Math.random() * 0.2 + 0.1
        }));
    }, []);

    useFrame(() => {
        if (!mesh.current) return;
        const pulling = pullState.velocity > 0.1;
        const speedMult = pulling ? 2.5 : 1;
        
        particles.forEach((p, i) => {
            p.y -= p.speed * speedMult;
            p.rx += p.rs * speedMult;
            p.ry += p.rs * speedMult;
            
            if (p.y < -3) {
                p.y = 15;
                p.x = (Math.random() - 0.5) * 20;
            }
            
            dummy.position.set(p.x, p.y, p.z);
            dummy.rotation.set(p.rx, p.ry, 0);
            dummy.scale.setScalar(p.scale);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={petalTex} transparent side={THREE.DoubleSide} depthWrite={false} color="#F57C00" />
        </instancedMesh>
    );
}

function SuccessDust() {
    const particleTex = useTexture('/textures/particle.png');
    const count = 200;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            x: (Math.random() - 0.5) * 15,
            y: (Math.random() - 0.5) * 10 - 5,
            z: (Math.random() - 0.5) * 15 + 2,
            speed: Math.random() * 0.08 + 0.04,
            scale: Math.random() * 0.5 + 0.2
        }));
    }, []);

    useFrame(() => {
        if (!mesh.current) return;
        if (!pullState.success) {
            // hide them far away
            dummy.position.set(0, -100, 0);
            for(let i=0; i<count; i++) {
                dummy.updateMatrix();
                mesh.current.setMatrixAt(i, dummy.matrix);
            }
            mesh.current.instanceMatrix.needsUpdate = true;
            return;
        }

        particles.forEach((p, i) => {
            p.y += p.speed; // fly up
            dummy.position.set(p.x, p.y, p.z);
            dummy.scale.setScalar(p.scale);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial 
                map={particleTex} 
                transparent 
                depthWrite={false} 
                blending={THREE.AdditiveBlending} 
                color="#FFD700" 
            />
        </instancedMesh>
    );
}

export function RathScene() {
    const reducedMotion = usePrefersReducedMotion();
    const [webglOk] = useState(isWebGLAvailable);

    useEffect(() => {
        if (!webglOk) return;
        // Init audio on first mount
        const handleInteraction = () => {
            audioManager.init();
            window.removeEventListener('pointerdown', handleInteraction);
        };
        window.addEventListener('pointerdown', handleInteraction);
        return () => window.removeEventListener('pointerdown', handleInteraction);
    }, [webglOk]);

    if (!webglOk) {
        return <ChariotFallback />;
    }

    return (
        <SceneErrorBoundary fallback={<ChariotFallback />}>
            <Canvas shadows camera={{ position: [0, 2, 8], fov: 60 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                <color attach="background" args={['#FFD54A']} />
                <fog attach="fog" args={['#FFD54A', 5, 40]} />

                <ambientLight intensity={0.6} color="#FFFDF7" />
                <directionalLight
                    position={[5, 10, 5]}
                    intensity={1.5}
                    castShadow={!reducedMotion}
                    shadow-mapSize={[1024, 1024]}
                    color="#FFFDF7"
                />
                <pointLight position={[-5, 5, -5]} intensity={0.5} color="#FFC107" />

                <Environment preset="sunset" />

                {reducedMotion ? (
                    <RathModel />
                ) : (
                    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
                        <RathModel />
                    </Float>
                )}

                <Petals reduced={reducedMotion} />
                <SuccessDust />

                {/* Ground */}
                <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#b68940" roughness={1} metalness={0} />
                </mesh>
            </Canvas>
        </SceneErrorBoundary>
    );
}
