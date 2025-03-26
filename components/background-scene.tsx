"use client"

import { useRef, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Float, Preload } from "@react-three/drei"
import { type Mesh, type Group, MathUtils } from "three"

function FloatingCube({ position, size, color, speed = 1, rotationFactor = 0.01 }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return

    // Gentle floating motion
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime * speed) * 0.002

    // Slow rotation
    meshRef.current.rotation.x += rotationFactor
    meshRef.current.rotation.y += rotationFactor * 0.8
  })

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} envMapIntensity={0.8} />
    </mesh>
  )
}

function FloatingSphere({ position, radius, color, speed = 1 }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return

    // Gentle floating motion
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime * speed) * 0.002
    meshRef.current.position.x += Math.cos(state.clock.elapsedTime * speed * 0.5) * 0.001
  })

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} metalness={0.2} roughness={0.4} envMapIntensity={1} />
    </mesh>
  )
}

function Scene() {
  const groupRef = useRef<Group>(null)
  const { camera } = useThree()

  // Move camera slightly based on mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!camera) return

      const x = (e.clientX / window.innerWidth - 0.5) * 0.5
      const y = (e.clientY / window.innerHeight - 0.5) * 0.5

      camera.position.x = MathUtils.lerp(camera.position.x, x, 0.1)
      camera.position.y = MathUtils.lerp(camera.position.y, y, 0.1)
      camera.lookAt(0, 0, 0)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [camera])

  return (
    <group ref={groupRef}>
      {/* Background objects */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <FloatingCube position={[-3, -1, -5]} size={[0.5, 0.5, 0.5]} color="#1a365d" speed={0.8} />
      </Float>

      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.3}>
        <FloatingCube position={[4, 1, -7]} size={[0.7, 0.7, 0.7]} color="#0d47a1" speed={0.5} />
      </Float>

      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.4}>
        <FloatingSphere position={[-5, 2, -10]} radius={1} color="#2e7d32" speed={0.3} />
      </Float>

      <Float speed={1.3} rotationIntensity={0.2} floatIntensity={0.6}>
        <FloatingSphere position={[5, -2, -8]} radius={0.8} color="#455a64" speed={0.7} />
      </Float>

      {/* Add more floating objects as needed */}
      <Float speed={0.8} rotationIntensity={0.4} floatIntensity={0.2}>
        <FloatingCube position={[2, 3, -12]} size={[0.6, 0.6, 0.6]} color="#2a4a7f" speed={0.4} />
      </Float>
    </group>
  )
}

export default function BackgroundScene() {
  return (
    <div className="fixed inset-0 -z-10 opacity-60">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={["#0f172a"]} />
        <fog attach="fog" args={["#0f172a", 5, 20]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow shadow-mapSize={1024} />
        <Scene />
        <Environment preset="city" />
        <Preload all />
      </Canvas>
    </div>
  )
}

