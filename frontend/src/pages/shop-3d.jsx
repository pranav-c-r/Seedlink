import React, { useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function Controls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef()
  
  useEffect(() => {
    const controls = controlsRef.current
    if (controls) {
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.rotateSpeed = 0.8
      controls.zoomSpeed = 0.8
      controls.panSpeed = 0.8
    }
  }, [])

  return <OrbitControls ref={controlsRef} args={[camera, gl.domElement]} enablePan={true} />
}

function Wall({ texture, position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Room({ arImages }) {
  const textures = useLoader(THREE.TextureLoader, arImages)
  return (
    <>
      <Wall texture={textures[0]} position={[0, 0, -2]} rotation={[0, 0, 0]} />
      <Wall texture={textures[1]} position={[0, 0, 2]} rotation={[0, Math.PI, 0]} />
      <Wall texture={textures[2]} position={[-2, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Wall texture={textures[3]} position={[2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      {/* Floor */}
      <mesh position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color={0x333333} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color={0x333333} />
      </mesh>
    </>
  )
}

export default function Shop3D() {
  const location = useLocation()
  const navigate = useNavigate()
  const { arImages, shopName } = location.state || {}

  if (!arImages || arImages.length < 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Images not found</h1>
        <p className="text-gray-300 mb-6">This shop has not uploaded the required four images.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-gold-primary hover:bg-gold-dark text-black font-bold py-2 px-4 rounded transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen relative">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-800/50 text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          ← Back to Shop
        </button>
      </div>
      <div className="absolute top-4 right-4 z-10 text-white bg-gray-800/50 p-2 rounded-lg">
        <h1 className="font-bold text-lg">{shopName || '3D View'}</h1>
      </div>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ width: '100%', height: '100vh' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Controls />
        <Room arImages={arImages} />
      </Canvas>
    </div>
  )
}
