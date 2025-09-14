import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import 'aframe';
import 'aframe-ar';

const MobileAR = ({ arImages, shopName }) => {
    const [arScene, setArScene] = useState(null);

    useEffect(() => {
        if (arImages && arImages.length >= 4) {
            const scene = document.createElement('a-scene');
            scene.setAttribute('arjs', 'sourceType: webcam; detectionMode: mono;');
            scene.setAttribute('embedded', 'true');
            scene.setAttribute('camera', 'active: true');
            scene.setAttribute('vr-mode-ui', 'enabled: false');
            setArScene(scene);

            const shop = document.createElement('a-entity');
            shop.setAttribute('position', '0 0 -5');
            shop.setAttribute('rotation', '0 45 0');
            shop.setAttribute('scale', '0.5 0.5 0.5');

            const textures = arImages.map(url => new THREE.TextureLoader().load(url));

            const material_front = `src: url(${arImages[1]}); side: double;`;
            const material_back = `src: url(${arImages[0]}); side: double;`;
            const material_left = `src: url(${arImages[2]}); side: double;`;
            const material_right = `src: url(${arImages[3]}); side: double;`;

            const frontWall = document.createElement('a-plane');
            frontWall.setAttribute('position', '0 0 2');
            frontWall.setAttribute('rotation', '0 180 0');
            frontWall.setAttribute('height', '4');
            frontWall.setAttribute('width', '4');
            frontWall.setAttribute('material', material_front);
            shop.appendChild(frontWall);

            const backWall = document.createElement('a-plane');
            backWall.setAttribute('position', '0 0 -2');
            backWall.setAttribute('height', '4');
            backWall.setAttribute('width', '4');
            backWall.setAttribute('material', material_back);
            shop.appendChild(backWall);

            const leftWall = document.createElement('a-plane');
            leftWall.setAttribute('position', '-2 0 0');
            leftWall.setAttribute('rotation', '0 90 0');
            leftWall.setAttribute('height', '4');
            leftWall.setAttribute('width', '4');
            leftWall.setAttribute('material', material_left);
            shop.appendChild(leftWall);

            const rightWall = document.createElement('a-plane');
            rightWall.setAttribute('position', '2 0 0');
            rightWall.setAttribute('rotation', '0 -90 0');
            rightWall.setAttribute('height', '4');
            rightWall.setAttribute('width', '4');
            rightWall.setAttribute('material', material_right);
            shop.appendChild(rightWall);
            
            const floor = document.createElement('a-plane');
            floor.setAttribute('position', '0 -2 0');
            floor.setAttribute('rotation', '-90 0 0');
            floor.setAttribute('height', '4');
            floor.setAttribute('width', '4');
            floor.setAttribute('material', 'color: #333333;');
            shop.appendChild(floor);

            const ceiling = document.createElement('a-plane');
            ceiling.setAttribute('position', '0 2 0');
            ceiling.setAttribute('rotation', '90 0 0');
            ceiling.setAttribute('height', '4');
            ceiling.setAttribute('width', '4');
            ceiling.setAttribute('material', 'color: #333333;');
            shop.appendChild(ceiling);
            
            scene.appendChild(shop);
            document.body.appendChild(scene);

            return () => {
                if (arScene) {
                    arScene.parentNode.removeChild(arScene);
                }
            };
        }
    }, [arImages]);

    return (
        <div className="fixed top-0 left-0 w-full h-full z-0">
            <div className="absolute top-4 right-4 z-10 text-white bg-gray-800/50 p-2 rounded-lg">
                <h1 className="font-bold text-lg">{shopName || 'AR View'}</h1>
            </div>
        </div>
    );
};

const MobileControl = () => {
  return <OrbitControls enableZoom={false} />;
};

function Controls() {
  const { camera } = useThree();
  const speed = 0.05;
  const turnSpeed = 0.03;
  const [keys, setKeys] = useState({});

  useEffect(() => {
    const handleKeyDown = (e) => setKeys((k) => ({ ...k, [e.key.toLowerCase()]: true }));
    const handleKeyUp = (e) => setKeys((k) => ({ ...k, [e.key.toLowerCase()]: false }));
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const direction = new THREE.Vector3();
    if (keys["w"]) {
      camera.getWorldDirection(direction);
      camera.position.addScaledVector(direction, speed);
    }
    if (keys["s"]) {
      camera.getWorldDirection(direction);
      camera.position.addScaledVector(direction, -speed);
    }
    if (keys["a"]) {
      camera.rotation.y += turnSpeed;
    }
    if (keys["d"]) {
      camera.rotation.y -= turnSpeed;
    }
    const margin = 0.2;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -2 + margin, 2 - margin);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -2 + margin, 2 - margin);
  });
  return null;
}

function Wall({ url, position, rotation }) {
  const texture = useLoader(THREE.TextureLoader, url);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Room({ arImages }) {
  const textureLoader = new THREE.TextureLoader();
  const textures = arImages.map(url => textureLoader.load(url));
  
  return (
    <>
      <Wall url={arImages[0]} position={[0, 0, -2]} rotation={[0, 0, 0]} />
      <Wall url={arImages[1]} position={[0, 0, 2]} rotation={[0, Math.PI, 0]} />
      <Wall url={arImages[2]} position={[-2, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Wall url={arImages[3]} position={[2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color={0x333333} />
      </mesh>
      <mesh position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color={0x333333} />
      </mesh>
    </>
  );
}

export default function Shop3D() {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const location = useLocation();
  const navigate = useNavigate();
  const { arImages, shopName, isAR } = location.state || {};
  
  if (!arImages || arImages.length < 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">AR images not found.</h1>
        <p className="text-gray-300 mb-6">This shop has not uploaded the required four images for the 3D view.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-gold-primary hover:bg-gold-dark text-black font-bold py-2 px-4 rounded transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative">
      <div className="absolute top-4 left-4 z-10">
        <button onClick={() => navigate(-1)} className="bg-gray-800/50 text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
          ← Back to Shop
        </button>
      </div>
      <div className="absolute top-4 right-4 z-10 text-white bg-gray-800/50 p-2 rounded-lg">
        <h1 className="font-bold text-lg">{shopName || '3D View'}</h1>
      </div>
      {isAR ? (
        <MobileAR arImages={arImages} shopName={shopName} />
      ) : (
        <Canvas camera={{ position: [0, 0, 2], fov: 75 }} className="w-screen h-screen">
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          {isMobile ? <MobileControl /> : <Controls />}
          <Room arImages={arImages} />
        </Canvas>
      )}
    </div>
  );
}