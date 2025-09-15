import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import '@google/model-viewer'

const MobileAR = ({ shopName }) => {
  return (
    <div className="w-screen h-screen">
      <model-viewer
        src="/models/shop.glb"
        ar
        ar-modes="scene-viewer quick-look webxr"
        camera-controls
        autoplay
        style={{ width: '100%', height: '100%' }}
      ></model-viewer>
      <div className="absolute top-4 right-4 z-10 text-white bg-gray-800/50 p-2 rounded-lg">
        <h1 className="font-bold text-lg">{shopName || 'AR View'}</h1>
      </div>
    </div>
  )
}

const MobileControl = () => {
  return <OrbitControls enableZoom={false} />
}

function Controls() {
  const { camera } = useThree()
  const speed = 0.05
  const turnSpeed = 0.03
  const [keys, setKeys] = useState({})

  useEffect(() => {
    const handleKeyDown = (e) => setKeys((k) => ({ ...k, [e.key.toLowerCase()]: true }))
    const handleKeyUp = (e) => setKeys((k) => ({ ...k, [e.key.toLowerCase()]: false }))
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    const direction = new THREE.Vector3()
    if (keys['w']) {
      camera.getWorldDirection(direction)
      camera.position.addScaledVector(direction, speed)
    }
    if (keys['s']) {
      camera.getWorldDirection(direction)
      camera.position.addScaledVector(direction, -speed)
    }
    if (keys['a']) {
      camera.rotation.y += turnSpeed
    }
    if (keys['d']) {
      camera.rotation.y -= turnSpeed
    }
    const margin = 0.2
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -2 + margin, 2 - margin)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -2 + margin, 2 - margin)
  })
  return null
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
      <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color={0x333333} />
      </mesh>
      <mesh position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color={0x333333} />
      </mesh>
    </>
  )
}

export default function Shop3D() {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent)
  const location = useLocation()
  const navigate = useNavigate()
  const { arImages, shopName } = location.state || {}

  if (!arImages || arImages.length < 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">AR images not found.</h1>
        <p className="text-gray-300 mb-6">This shop has not uploaded the required four images for the 3D/AR view.</p>
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
        <h1 className="font-bold text-lg">{shopName || (isMobile ? 'AR View' : '3D View')}</h1>
      </div>
      {isMobile ? (
        <MobileAR shopName={shopName} />
      ) : (
        <Canvas camera={{ position: [0, 0, 2], fov: 75 }} className="w-screen h-screen">
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <Controls />
          <Room arImages={arImages} />
        </Canvas>
      )}
    </div>
  )
}
