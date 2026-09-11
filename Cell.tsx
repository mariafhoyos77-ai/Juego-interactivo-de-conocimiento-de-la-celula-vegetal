import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Label } from "./TextPlane";

/* ---------- utilidades ---------- */

/** Generador pseudoaleatorio determinista (para que la escena no cambie entre renders) */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface InstanceItem {
  position: [number, number, number];
  scale?: number | [number, number, number];
  quaternion?: THREE.Quaternion;
}

/** Malla instanciada genérica: los hijos deben ser una geometría y un material */
export function Instanced({
  items,
  children,
}: {
  items: InstanceItem[];
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    const q = new THREE.Quaternion();
    items.forEach((it, i) => {
      p.set(it.position[0], it.position[1], it.position[2]);
      if (typeof it.scale === "number") s.setScalar(it.scale);
      else if (it.scale) s.set(it.scale[0], it.scale[1], it.scale[2]);
      else s.setScalar(1);
      m.compose(p, it.quaternion ?? q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} frustumCulled={false}>
      {children}
    </instancedMesh>
  );
}

/** Cilindro entre dos puntos */
export function Tube({
  a,
  b,
  radius = 0.08,
  color = "#ffb74d",
  emissive,
}: {
  a: [number, number, number];
  b: [number, number, number];
  radius?: number;
  color?: string;
  emissive?: string;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = new THREE.Vector3().subVectors(vb, va);
    const length = dir.length();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    const position = va.clone().add(vb).multiplyScalar(0.5);
    return { position, quaternion, length };
  }, [a, b]);
  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 8, 1]} />
      <meshStandardMaterial
        color={color}
        roughness={0.45}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissive ? 0.4 : 0}
      />
    </mesh>
  );
}

/* ---------- textura de celulosa ---------- */

function useCelluloseTexture() {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#93c05a";
    c.fillRect(0, 0, size, size);
    const rnd = mulberry32(7);
    const palette = ["#7fae49", "#a5d06a", "#6f9e3d", "#b7dc7e", "#88b854"];
    for (let i = 0; i < 520; i++) {
      const horizontal = rnd() < 0.5;
      const x = rnd() * size;
      const y = rnd() * size;
      const len = 60 + rnd() * 260;
      const ang = (horizontal ? 0 : Math.PI / 2) + (rnd() - 0.5) * 0.5;
      c.strokeStyle = palette[Math.floor(rnd() * palette.length)];
      c.globalAlpha = 0.18 + rnd() * 0.3;
      c.lineWidth = 1.5 + rnd() * 4;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(x - (Math.cos(ang) * len) / 2, y - (Math.sin(ang) * len) / 2);
      c.lineTo(x + (Math.cos(ang) * len) / 2, y + (Math.sin(ang) * len) / 2);
      c.stroke();
    }
    c.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 3);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);
}

/* ---------- envoltura: pared + membrana ---------- */

export function CellShell() {
  const cellulose = useCelluloseTexture();
  return (
    <group>
      {/* Pared celular (vista desde dentro) */}
      <RoundedBox args={[64, 28, 64]} radius={8} smoothness={7} position={[0, 14, 0]}>
        <meshStandardMaterial
          map={cellulose}
          bumpMap={cellulose}
          bumpScale={0.6}
          color="#c5e1a5"
          roughness={0.95}
          metalness={0}
          side={THREE.BackSide}
        />
      </RoundedBox>
      {/* Membrana plasmática, translúcida, justo por dentro */}
      <RoundedBox
        args={[61, 25.6, 61]}
        radius={7.6}
        smoothness={7}
        position={[0, 12.8, 0]}
        renderOrder={-5}
      >
        <meshPhysicalMaterial
          color="#eef7a6"
          transparent
          opacity={0.28}
          roughness={0.35}
          metalness={0}
          clearcoat={0.6}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </RoundedBox>
    </group>
  );
}

/* ---------- citoplasma: partículas ---------- */

export function Cytoplasm() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rnd = mulberry32(21);
    const count = 2200;
    const arr = new Float32Array(count * 3);
    let i = 0;
    while (i < count) {
      const x = (rnd() - 0.5) * 56;
      const y = 0.3 + rnd() * 23;
      const z = (rnd() - 0.5) * 56;
      // fuera de la vacuola
      const dx = x,
        dy = (y - 9.5) / 0.9,
        dz = z / 1.1;
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 9.6) continue;
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
      i++;
    }
    return arr;
  }, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.012;
    ref.current.position.y = Math.sin(t * 0.3) * 0.4;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#fff9c4"
        size={0.16}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  );
}

/* ---------- citoesqueleto ---------- */

const MICROTUBULES: [[number, number, number], [number, number, number]][] = [
  [[-26, 3, -22], [-8, 12, -26]],
  [[-26, 8, 10], [-12, 3, 26]],
  [[24, 4, 20], [10, 11, 27]],
  [[26, 10, -24], [12, 3, -27]],
  [[-27, 6, -2], [-24, 14, 24]],
  [[27, 5, 2], [26, 13, -22]],
  [[-20, 12, -27], [20, 9, -27]],
  [[-18, 10, 27], [22, 14, 26]],
  [[-27, 12, -18], [-26, 4, 20]],
  [[25, 12, 14], [-4, 15, 27]],
  [[2, 16, -27], [26, 13, -8]],
  [[-10, 18, -20], [-27, 20, 6]],
  [[-14, 6, 24], [-2, 9, 27]],
  [[8, 6, 24], [22, 5, 22]],
];

export function Cytoskeleton() {
  const filaments = useMemo(() => {
    const rnd = mulberry32(99);
    const list: [[number, number, number], [number, number, number]][] = [];
    for (let i = 0; i < 16; i++) {
      const ang = rnd() * Math.PI * 2;
      const r = 20 + rnd() * 6;
      const x = Math.cos(ang) * r;
      const z = Math.sin(ang) * r;
      const y = 1 + rnd() * 12;
      const dx = (rnd() - 0.5) * 10;
      const dz = (rnd() - 0.5) * 10;
      const dy = (rnd() - 0.5) * 6;
      list.push([
        [x, y, z],
        [Math.max(-27, Math.min(27, x + dx)), Math.max(0.5, y + dy), Math.max(-27, Math.min(27, z + dz))],
      ]);
    }
    return list;
  }, []);
  return (
    <group>
      {MICROTUBULES.map(([a, b], i) => (
        <Tube key={`mt${i}`} a={a} b={b} radius={0.11} color="#ffb74d" />
      ))}
      {filaments.map(([a, b], i) => (
        <Tube key={`af${i}`} a={a} b={b} radius={0.045} color="#ffe0b2" />
      ))}
      <Label text="Citoesqueleto (microtúbulos)" position={[-14, 8.6, 26.2]} accent="#ffb74d" small />
    </group>
  );
}

/* ---------- plasmodesmos ---------- */

export function Plasmodesmata() {
  const tubes: [number, number][] = [
    [11, 1.3],
    [12.3, 2.4],
    [13.6, 1.3],
    [11.6, 3.4],
    [13.0, 3.5],
  ];
  return (
    <group>
      {tubes.map(([x, y], i) => (
        <group key={i}>
          <Tube a={[x, y, 29.7]} b={[x, y, 33.2]} radius={0.22} color="#dcedc8" />
          <mesh position={[x, y, 30.5]}>
            <torusGeometry args={[0.42, 0.09, 10, 24]} />
            <meshStandardMaterial color="#c0ca33" roughness={0.4} />
          </mesh>
        </group>
      ))}
      <Label text="Plasmodesmos (canales entre células)" position={[12.3, 5, 30.3]} accent="#dcedc8" small />
    </group>
  );
}

/* ---------- exhibiciones didácticas ---------- */

/** Fibras de celulosa entrecruzadas frente a la pared */
export function WallExhibit() {
  const rods = useMemo(() => {
    const out: { a: [number, number, number]; b: [number, number, number]; color: string; r: number }[] = [];
    for (let i = 0; i < 9; i++) {
      const y = 0.9 + i * 0.42;
      out.push({ a: [4.8, y, 29.3], b: [9.2, y, 29.3], color: i % 2 ? "#9ccc65" : "#c5e1a5", r: 0.09 });
    }
    for (let i = 0; i < 10; i++) {
      const x = 5 + i * 0.45;
      out.push({ a: [x, 0.7, 29.55], b: [x, 4.5, 29.55], color: i % 2 ? "#aed581" : "#8bc34a", r: 0.09 });
    }
    for (let i = 0; i < 6; i++) {
      const x = 4.6 + i * 0.8;
      out.push({ a: [x, 0.8, 29.05], b: [x + 1.6, 4.4, 29.05], color: "#dcedc8", r: 0.06 });
    }
    return out;
  }, []);
  return (
    <group>
      {rods.map((r, i) => (
        <Tube key={i} a={r.a} b={r.b} radius={r.r} color={r.color} />
      ))}
      <Label text="Fibras de celulosa (ampliadas)" position={[7, 5, 29.2]} accent="#c5e1a5" small />
    </group>
  );
}

/** Bicapa de fosfolípidos ampliada frente a la membrana */
export function MembraneExhibit() {
  const { heads, tails } = useMemo(() => {
    const heads: InstanceItem[] = [];
    const tails: InstanceItem[] = [];
    for (let layer = 0; layer < 2; layer++) {
      const x = -28.6 + layer * 0.42;
      for (let i = 0; i < 13; i++) {
        const z = 11.6 + i * 0.4;
        heads.push({ position: [x, 2.95, z] });
        heads.push({ position: [x, 1.45, z] });
        tails.push({ position: [x, 2.5, z], scale: [1, 1, 1] });
        tails.push({ position: [x, 1.9, z], scale: [1, 1, 1] });
      }
    }
    return { heads, tails };
  }, []);
  return (
    <group>
      <Instanced items={heads}>
        <sphereGeometry args={[0.19, 14, 12]} />
        <meshStandardMaterial color="#fdd835" roughness={0.35} />
      </Instanced>
      <Instanced items={tails}>
        <cylinderGeometry args={[0.045, 0.045, 0.62, 6]} />
        <meshStandardMaterial color="#f9a825" roughness={0.5} />
      </Instanced>
      {/* proteínas de membrana */}
      {[12.6, 15.4].map((z) => (
        <mesh key={z} position={[-28.4, 2.2, z]}>
          <cylinderGeometry args={[0.36, 0.36, 2.1, 20]} />
          <meshStandardMaterial color="#7e57c2" roughness={0.4} />
        </mesh>
      ))}
      <Label text="Bicapa de fosfolípidos + proteínas (ampliada)" position={[-28.4, 4.1, 14]} accent="#fdd835" small />
    </group>
  );
}

/* ---------- iluminación ---------- */

export function Lights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#f1f8e9", "#7cb342", 0.8]} />
      <directionalLight position={[12, 26, 10]} intensity={1.5} color="#fffde7" />
      <directionalLight position={[-16, 18, -12]} intensity={0.6} color="#e8f5e9" />
      <pointLight position={[0, 10, 0]} intensity={40} distance={30} color="#81d4fa" />
      <pointLight position={[-19, 7, -13]} intensity={25} distance={22} color="#ffe0b2" />
      <pointLight position={[15, 4, 13]} intensity={15} distance={18} color="#ffccbc" />
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={2} position={[0, 12, 0]} rotation-x={Math.PI / 2} scale={[24, 24, 1]} color="#f9fbe7" />
        <Lightformer intensity={1} position={[-12, 4, -12]} scale={[10, 6, 1]} color="#a5d6a7" />
        <Lightformer intensity={1} position={[12, 4, 12]} rotation-y={Math.PI} scale={[10, 6, 1]} color="#b3e5fc" />
      </Environment>
    </>
  );
}
