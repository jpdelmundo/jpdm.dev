import { Canvas } from "@react-three/fiber";
import Blobs from "./Blobs";

export default function BackgroundCanvas() {
    return (
        <Canvas
            camera={{ position: [0, 2, 12], fov: 60 }}
            style={{ position: "fixed", inset: 0, zIndex: -1, filter: 'saturate(1.8)' }}
        >
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[0, 5, 0]}
                intensity={2}
            // castShadow
            />
            <directionalLight
                position={[-1, -10, -2]}
                intensity={2}
                // castShadow
                color={'#ff6600'} />
            <Blobs count={10} />
        </Canvas>
    );
}