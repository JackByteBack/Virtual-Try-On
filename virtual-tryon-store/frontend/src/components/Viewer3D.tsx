"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Center } from "@react-three/drei";
import { Suspense } from "react";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-white text-center">
        <svg className="animate-spin h-10 w-10 mx-auto mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p>Loading 3D model...</p>
      </div>
    </div>
  );
}

export default function Viewer3D({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="relative h-[600px] w-full rounded-xl bg-gray-900 overflow-hidden">
      <Canvas camera={{ position: [0, 1.2, 2.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 2]} intensity={1} />
        <Suspense fallback={null}>
          <Center>
            <Model url={modelUrl} />
          </Center>
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={1.5} maxDistance={4} />
      </Canvas>
      <div className="absolute bottom-4 left-4 text-white/60 text-sm">
        Drag to rotate | Scroll to zoom
      </div>
    </div>
  );
}
