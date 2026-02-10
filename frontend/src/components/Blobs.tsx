import { DepthOfField, EffectComposer } from '@react-three/postprocessing';
import { useMemo } from "react";
import * as THREE from "three";

export default function Blobs({ count }: { count: number }) {
    const blobs = useMemo(() => {
        // const neonPalette = [
        //     "#FF00FF", // Magenta
        //     //"#00FFFF", // Cyan
        //     //"#00FF00", // Electric Green
        //     //"#FFFF00", // Bright Yellow
        //     "#FF0000", // Electric Red
        //     "#0000ffff", // Electric Blue
        //     "#FF6BFF", // Pink
        //     //"#00FFCC", // Aqua
        //     "#CC00FF", // Purple
        //     //"#FFAA00", // Orange
        // ];
        const arr: {
            position: [number, number, number];
            scale: number;
            color: THREE.Color;
        }[] = [];

        for (let i = 0; i < count; i++) {
            //const randomColor = neonPalette[Math.floor(Math.random() * neonPalette.length)];
            arr.push({
                position: [
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 6 - 3, // Bottom 75% only
                    //(Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 15,
                ] as [number, number, number],
                scale: 1.2 + Math.random() * 1.2,
                color: new THREE.Color(`hsl(${Math.random() * 360}, 70%, 60%)`)
                //color: new THREE.Color(randomColor)
            });
        }

        return arr;
    }, []);

    return (
        <>
            {blobs.map((blob, i) => (
                <mesh key={i}
                    position={blob.position}
                    scale={blob.scale}
                    castShadow
                    receiveShadow
                >
                    {/* <icosahedronGeometry args={[1, 8]} /> */}
                    {/* <sphereGeometry args={[1, 64, 64]} /> */}
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial
                        color={blob.color}
                        roughness={0.7}
                    //metalness={1}
                    />
                </mesh>
            ))}

            <EffectComposer>
                <DepthOfField
                    focusDistance={0}  // where the camera focuses (0–1)
                    focalLength={0.05}    // strength of focus
                    bokehScale={25}        // blur scale (increase for stronger blur)
                //blur={10}
                />
            </EffectComposer>
        </>
    );
}

// import { useThree } from "@react-three/fiber";
// import { useEffect, useMemo } from "react";
// import * as THREE from "three";

// export default function Blobs({ count }: { count: number }) {
//     const { gl, scene, camera } = useThree();

//     // Generate blobs once
//     const blobs = useMemo(() => {
//         const arr: { position: [number, number, number]; scale: number; color: THREE.Color }[] = [];

//         for (let i = 0; i < count; i++) {
//             arr.push({
//                 position: [
//                     (Math.random() - 0.5) * 8,
//                     (Math.random() - 0.5) * 6 - 3,
//                     (Math.random() - 0.5) * 15,
//                 ] as [number, number, number],
//                 scale: 1.2 + Math.random() * 1.2,
//                 color: new THREE.Color(`hsl(${Math.random() * 360}, 70%, 60%)`),
//             });
//         }

//         return arr;
//     }, [count]);

//     // Render once after mount
//     useEffect(() => {
//         gl.render(scene, camera);
//     }, [gl, scene, camera]);

//     return (
//         <>
//             {blobs.map((blob, i) => (
//                 <mesh key={i} position={blob.position} scale={blob.scale}>
//                     {/* Lower-poly sphere for performance */}
//                     <sphereGeometry args={[1, 16, 16]} />
//                     <meshStandardMaterial color={blob.color} roughness={0.7} />
//                 </mesh>
//             ))}
//         </>
//     );
// }
