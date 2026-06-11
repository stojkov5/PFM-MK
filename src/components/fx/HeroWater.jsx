// src/components/fx/HeroWater.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./HeroWater.css";

const vertexShader = /* glsl */ `
  uniform float uTime;
  attribute float aScale;
  varying float vElev;
  void main() {
    vec3 p = position;
    float e = sin(p.x * 0.55 + uTime * 0.8) * 0.35
            + sin(p.y * 0.95 + uTime * 0.55) * 0.25
            + sin((p.x + p.y) * 0.4 + uTime * 0.35) * 0.2;
    p.z += e;
    vElev = e;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * (16.0 / -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vElev;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    vec3 deep  = vec3(0.145, 0.388, 0.922);
    vec3 light = vec3(0.220, 0.741, 0.973);
    vec3 col = mix(deep, light, clamp(vElev * 0.9 + 0.5, 0.0, 1.0));
    gl_FragColor = vec4(col, a * 0.5);
  }
`;

/* deterministic pseudo-random so render stays pure */
const pseudoRandom = (seed) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const WaveField = ({ cols, rows }) => {
  const matRef = useRef(null);

  const { positions, scales } = useMemo(() => {
    const pos = new Float32Array(cols * rows * 3);
    const sc = new Float32Array(cols * rows);
    let i = 0;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        pos[i * 3] = (x / (cols - 1) - 0.5) * 24;
        pos[i * 3 + 1] = (y / (rows - 1) - 0.5) * 12;
        pos[i * 3 + 2] = 0;
        sc[i] = 0.6 + pseudoRandom(i) * 0.9;
        i += 1;
      }
    }
    return { positions: pos, scales: sc };
  }, [cols, rows]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <points rotation={[-1.15, 0, 0]} position={[0, -2.2, 0]}>
      <bufferGeometry key={`${cols}x${rows}`}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const HeroWater = () => {
  const wrapRef = useRef(null);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);
  const isMobile = useMemo(
    () => window.matchMedia("(max-width: 767px)").matches,
    []
  );

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting)
    );
    if (wrapRef.current) io.observe(wrapRef.current);

    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const running = onScreen && tabVisible;

  return (
    <div ref={wrapRef} className="pfm-hero-water" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={running ? "always" : "never"}
        camera={{ position: [0, 1.6, 7], fov: 55 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      >
        <WaveField cols={isMobile ? 70 : 130} rows={isMobile ? 36 : 60} />
      </Canvas>
    </div>
  );
};

export default HeroWater;
