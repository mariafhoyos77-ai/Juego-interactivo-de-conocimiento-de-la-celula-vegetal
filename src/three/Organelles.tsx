import { Shadow } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  CHLOROPLASTS,
  MITOCHONDRIA,
  ORGANELLES,
  PEROXISOMES,
} from "../data/organelles";
import { Instanced, InstanceItem, Tube, mulberry32 } from "./Cell";
import { Label } from "./TextPlane";

/* ---------- Vacuola central ---------- */

export function Vacuole() {
  const group = useRef<THREE.Group>(null);
  const bubbles = useMemo<InstanceItem[]>(() => {
    const rnd = mulberry32(3);
    const items: InstanceItem[] = [];
    for (let i = 0; i < 46; i++) {
      const u = rnd() * Math.PI * 2;
      const v = Math.acos(2 * rnd() - 1);
      const r = Math.cbrt(rnd()) * 7.4;
      items.push({
        position: [r * Math.sin(v) * Math.cos(u), r * Math.cos(v), r * Math.sin(v) * Math.sin(u)],
        scale: 0.18 + rnd() * 0.35,
      });
    }
    return items;
  }, []);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const s = 1 + Math.sin(t * 0.6) * 0.008;
    group.current.scale.set(s, 0.9 * s, 1.1 * s);
    group.current.rotation.y = t * 0.02;
  });
  return (
    <group>
      <group ref={group} position={[0, 9.5, 0]} scale={[1, 0.9, 1.1]}>
        <mesh renderOrder={-2}>
          <sphereGeometry args={[9, 64, 48]} />
          <meshPhysicalMaterial
            color="#5ecbf5"
            transparent
            opacity={0.42}
            roughness={0.05}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.1}
            depthWrite={false}
          />
        </mesh>
        <mesh renderOrder={-3}>
          <sphereGeometry args={[8.3, 48, 32]} />
          <meshPhysicalMaterial
            color="#29b6f6"
            transparent
            opacity={0.18}
            roughness={0.2}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>
        <Instanced items={bubbles}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#e1f5fe" transparent opacity={0.7} roughness={0.2} />
        </Instanced>
      </group>
      <Shadow position={[0, 0.03, 0]} scale={17} color="#1b5e20" opacity={0.3} />
      <Label text="Tonoplasto (membrana de la vacuola)" position={[7.2, 3.6, 8.2]} accent="#4fc3f7" small />
    </group>
  );
}

/* ---------- Núcleo ---------- */

function fibonacciSphere(n: number, radius: number) {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius));
  }
  return pts;
}

export function Nucleus({ position }: { position: [number, number, number] }) {
  const chromatin = useRef<THREE.Group>(null);
  const pores = useMemo<InstanceItem[]>(() => {
    const up = new THREE.Vector3(0, 0, 1);
    return fibonacciSphere(34, 5.02).map((p) => ({
      position: [p.x, p.y, p.z] as [number, number, number],
      quaternion: new THREE.Quaternion().setFromUnitVectors(up, p.clone().normalize()),
    }));
  }, []);
  const strands = useMemo(() => {
    const rnd = mulberry32(11);
    const geos: THREE.TubeGeometry[] = [];
    for (let s = 0; s < 6; s++) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < 7; i++) {
        const u = rnd() * Math.PI * 2;
        const v = Math.acos(2 * rnd() - 1);
        const r = 1.2 + rnd() * 2.6;
        pts.push(new THREE.Vector3(r * Math.sin(v) * Math.cos(u), r * Math.cos(v), r * Math.sin(v) * Math.sin(u)));
      }
      const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.6);
      geos.push(new THREE.TubeGeometry(curve, 90, 0.12, 7, false));
    }
    return geos;
  }, []);
  useFrame(({ clock }) => {
    if (chromatin.current) chromatin.current.rotation.y = clock.getElapsedTime() * 0.05;
  });
  return (
    <group position={position}>
      {/* envoltura nuclear */}
      <mesh renderOrder={-1}>
        <sphereGeometry args={[5, 48, 36]} />
        <meshPhysicalMaterial
          color="#cfd8dc"
          transparent
          opacity={0.3}
          roughness={0.15}
          clearcoat={0.8}
          depthWrite={false}
        />
      </mesh>
      {/* poros nucleares */}
      <Instanced items={pores}>
        <torusGeometry args={[0.36, 0.09, 8, 20]} />
        <meshStandardMaterial color="#78909c" roughness={0.5} />
      </Instanced>
      {/* cromatina */}
      <group ref={chromatin}>
        {strands.map((g, i) => (
          <mesh key={i} geometry={g}>
            <meshStandardMaterial color={i % 2 ? "#7e57c2" : "#9575cd"} roughness={0.55} />
          </mesh>
        ))}
      </group>
      {/* nucléolo */}
      <mesh position={[0.8, -0.3, 0.6]}>
        <sphereGeometry args={[1.7, 32, 24]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.7} />
      </mesh>
      <Label text="Nucléolo" position={[0.8, 1.9, 0.6]} accent="#8d6e63" small />
      <Label text="Cromatina (ADN)" position={[-2.2, -2.6, 2.2]} accent="#9575cd" small />
      <Shadow position={[0, -position[1] + 0.03, 0]} scale={13} color="#1b5e20" opacity={0.35} />
    </group>
  );
}

/* ---------- Retículo endoplasmático rugoso ---------- */

export function RoughER({ center }: { center: [number, number, number] }) {
  const thetaStart = Math.PI / 2 - 0.72;
  const thetaLength = 1.44;
  const radii = [6.8, 8.0, 9.2, 10.4];
  const { sheets, ribos } = useMemo(() => {
    const rnd = mulberry32(5);
    const wob = (theta: number, y: number, k: number) => 0.22 * Math.sin(theta * 7 + y * 1.6 + k);
    const sheets = radii.map((r, k) => {
      const geo = new THREE.CylinderGeometry(r, r, 3.6, 40, 6, true, thetaStart, thetaLength);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const theta = Math.atan2(x, z);
        const rr = Math.sqrt(x * x + z * z) + wob(theta, y, k);
        pos.setX(i, Math.sin(theta) * rr);
        pos.setZ(i, Math.cos(theta) * rr);
      }
      geo.computeVertexNormals();
      return geo;
    });
    const ribos: InstanceItem[] = [];
    radii.forEach((r, k) => {
      for (let i = 0; i < 90; i++) {
        const theta = thetaStart + rnd() * thetaLength;
        const y = (rnd() - 0.5) * 3.3;
        const side = rnd() < 0.5 ? 0.17 : -0.17;
        const rr = r + wob(theta, y, k) + side;
        ribos.push({ position: [Math.sin(theta) * rr, y, Math.cos(theta) * rr], scale: 0.8 + rnd() * 0.5 });
      }
    });
    return { sheets, ribos };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <group position={[center[0], 1.9, center[2]]}>
      {sheets.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial
            color={i % 2 ? "#66bb6a" : "#81c784"}
            roughness={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <Instanced items={ribos}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color="#8e24aa" roughness={0.5} />
      </Instanced>
    </group>
  );
}

/* ---------- Retículo endoplasmático liso ---------- */

export function SmoothER({ center }: { center: [number, number, number] }) {
  const geos = useMemo(() => {
    const rnd = mulberry32(17);
    const list: THREE.TubeGeometry[] = [];
    for (let t = 0; t < 5; t++) {
      const pts: THREE.Vector3[] = [];
      const n = 7;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 + rnd() * 0.5;
        const r = 1.4 + rnd() * 2.4;
        pts.push(new THREE.Vector3(Math.cos(ang) * r, 0.6 + rnd() * 2.4, Math.sin(ang) * r));
      }
      const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal", 0.5);
      list.push(new THREE.TubeGeometry(curve, 110, 0.3, 10, true));
    }
    return list;
  }, []);
  return (
    <group position={[center[0], 0, center[2]]}>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color={i % 2 ? "#ffcc80" : "#ffb74d"} roughness={0.4} />
        </mesh>
      ))}
      <Shadow position={[0, 0.03, 0]} scale={9} color="#1b5e20" opacity={0.3} />
    </group>
  );
}

/* ---------- Aparato de Golgi ---------- */

export function Golgi({ position }: { position: [number, number, number] }) {
  const vesicles = useMemo<InstanceItem[]>(() => {
    const rnd = mulberry32(31);
    const items: InstanceItem[] = [];
    for (let i = 0; i < 18; i++) {
      const ang = rnd() * Math.PI * 2;
      const r = 2.4 + rnd() * 1.4;
      items.push({ position: [Math.cos(ang) * r, 0.4 + rnd() * 3.6, Math.sin(ang) * r * 0.7], scale: 0.2 + rnd() * 0.22 });
    }
    return items;
  }, []);
  return (
    <group position={position} rotation={[0, 0.4, 0]}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          position={[0, 0.5 + i * 0.58, i * 0.12]}
          rotation={[0.08 * (i - 2.5), 0, 0]}
          scale={[2.7 - i * 0.16, 0.16, 1.7 - i * 0.08]}
        >
          <sphereGeometry args={[1, 32, 16]} />
          <meshStandardMaterial color={i % 2 ? "#ffab91" : "#ff8a65"} roughness={0.45} />
        </mesh>
      ))}
      <Instanced items={vesicles}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#ffccbc" roughness={0.4} />
      </Instanced>
      <Shadow position={[0, 0.03, 0]} scale={7.5} color="#1b5e20" opacity={0.35} />
    </group>
  );
}

/* ---------- Cloroplasto ---------- */

export function Chloroplast({
  position,
  rotation,
  phase = 0,
}: {
  position: [number, number, number];
  rotation: number;
  phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.7 + phase) * 0.07;
  });
  const grana = [-1.25, -0.42, 0.42, 1.25];
  return (
    <group>
      <group ref={ref} position={position} rotation={[0, rotation, 0]}>
        {/* estroma / envoltura */}
        <mesh scale={[2.2, 1.1, 1.3]} renderOrder={1}>
          <sphereGeometry args={[1, 40, 28]} />
          <meshPhysicalMaterial
            color="#5cb85c"
            transparent
            opacity={0.48}
            roughness={0.3}
            clearcoat={0.6}
            depthWrite={false}
          />
        </mesh>
        {/* grana: pilas de tilacoides */}
        {grana.map((x, gi) => (
          <group key={gi} position={[x, -0.25 + (gi % 2) * 0.1, (gi % 2 ? 0.25 : -0.25)]}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <mesh key={i} position={[0, i * 0.11, 0]}>
                <cylinderGeometry args={[0.34, 0.34, 0.06, 20]} />
                <meshStandardMaterial color={i % 2 ? "#1b5e20" : "#2e7d32"} roughness={0.5} />
              </mesh>
            ))}
          </group>
        ))}
        {/* lamelas que conectan los grana */}
        {grana.slice(0, -1).map((x, i) => (
          <Tube
            key={i}
            a={[x, 0.05 + (i % 2) * 0.1, i % 2 ? 0.25 : -0.25]}
            b={[grana[i + 1], 0.05 + ((i + 1) % 2) * 0.1, (i + 1) % 2 ? 0.25 : -0.25]}
            radius={0.05}
            color="#388e3c"
          />
        ))}
      </group>
      <Shadow position={[position[0], 0.03, position[2]]} rotation={[-Math.PI / 2, 0, -rotation]} scale={[5.4, 3.4, 1]} color="#1b5e20" opacity={0.35} />
    </group>
  );
}

/* ---------- Mitocondria ---------- */

export function Mitochondrion({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: number;
}) {
  const cristae = [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5];
  return (
    <group>
      <group position={position} rotation={[0, rotation, 0]}>
        <mesh scale={[2.2, 1.0, 1.0]} renderOrder={1}>
          <sphereGeometry args={[1, 40, 28]} />
          <meshPhysicalMaterial
            color="#ff8a65"
            transparent
            opacity={0.5}
            roughness={0.35}
            clearcoat={0.5}
            depthWrite={false}
          />
        </mesh>
        {cristae.map((x, i) => {
          const h = 0.9 - Math.abs(x) * 0.18;
          return (
            <mesh key={i} position={[x, i % 2 ? 0.22 : -0.22, 0]}>
              <boxGeometry args={[0.07, h, 1.1 - Math.abs(x) * 0.25]} />
              <meshStandardMaterial color="#e64a19" roughness={0.5} />
            </mesh>
          );
        })}
        <mesh scale={[1.95, 0.78, 0.78]} renderOrder={0}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color="#ffab91" transparent opacity={0.22} roughness={0.6} depthWrite={false} />
        </mesh>
      </group>
      <Shadow position={[position[0], 0.03, position[2]]} rotation={[-Math.PI / 2, 0, -rotation]} scale={[5.2, 2.6, 1]} color="#1b5e20" opacity={0.35} />
    </group>
  );
}

/* ---------- Ribosomas libres ---------- */

export function Ribosomes({ cluster }: { cluster: [number, number, number] }) {
  const items = useMemo<InstanceItem[]>(() => {
    const rnd = mulberry32(41);
    const list: InstanceItem[] = [];
    // dispersos por el citoplasma
    let n = 0;
    while (n < 700) {
      const x = (rnd() - 0.5) * 54;
      const y = 0.25 + rnd() * 12;
      const z = (rnd() - 0.5) * 54;
      const d = Math.sqrt(x * x + ((y - 9.5) / 0.9) ** 2 + (z / 1.1) ** 2);
      if (d < 10) continue;
      list.push({ position: [x, y, z], scale: 0.7 + rnd() * 0.6 });
      n++;
    }
    // cúmulo denso junto al checkpoint
    for (let i = 0; i < 110; i++) {
      const ang = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * 3.2;
      list.push({
        position: [cluster[0] + Math.cos(ang) * r, 0.3 + rnd() * 3.2, cluster[2] + Math.sin(ang) * r],
        scale: 1.4 + rnd() * 0.9,
      });
    }
    return list;
  }, [cluster]);
  return (
    <group>
      <Instanced items={items}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color="#ab47bc" roughness={0.45} />
      </Instanced>
      {/* polirribosoma: cadena de ribosomas sobre ARN mensajero */}
      <Tube a={[cluster[0] - 2.4, 1.6, cluster[2] + 2.6]} b={[cluster[0] + 2.6, 1.9, cluster[2] + 3.2]} radius={0.035} color="#e1bee7" />
      <Label text="Polirribosoma (ribosomas sobre ARNm)" position={[cluster[0], 2.8, cluster[2] + 3]} accent="#ce93d8" small />
    </group>
  );
}

/* ---------- Peroxisoma ---------- */

export function Peroxisome({ position }: { position: [number, number, number] }) {
  const core = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (core.current) core.current.rotation.y = clock.getElapsedTime() * 0.4;
  });
  return (
    <group>
      <group position={position}>
        <mesh renderOrder={1}>
          <sphereGeometry args={[0.9, 32, 24]} />
          <meshPhysicalMaterial color="#f06292" transparent opacity={0.5} roughness={0.25} clearcoat={0.7} depthWrite={false} />
        </mesh>
        <mesh ref={core}>
          <icosahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial color="#ad1457" roughness={0.3} flatShading emissive="#880e4f" emissiveIntensity={0.3} />
        </mesh>
      </group>
      <Shadow position={[position[0], 0.03, position[2]]} scale={2.6} color="#1b5e20" opacity={0.3} />
    </group>
  );
}

/* ---------- Conjunto + etiquetas ---------- */

export function Organelles() {
  return (
    <group>
      <Vacuole />
      <Nucleus position={[-19, 5, -13]} />
      <RoughER center={[-19, 0, -13]} />
      <SmoothER center={[-14, 0, 2]} />
      <Golgi position={[15, 0, 13]} />
      {CHLOROPLASTS.map((c, i) => (
        <Chloroplast key={i} position={c.position} rotation={c.rotation} phase={i * 1.3} />
      ))}
      {MITOCHONDRIA.map((m, i) => (
        <Mitochondrion key={i} position={m.position} rotation={m.rotation} />
      ))}
      <Ribosomes cluster={[1, 0, -20]} />
      {PEROXISOMES.map((p, i) => (
        <Peroxisome key={i} position={p} />
      ))}

      {/* Etiquetas principales (como en el diagrama) */}
      {ORGANELLES.map((o) => (
        <Label key={o.id} text={o.name} position={o.label} accent={o.color} />
      ))}
      {/* Etiquetas secundarias de instancias repetidas */}
      {CHLOROPLASTS.slice(1).map((c, i) => (
        <Label key={`cl${i}`} text="Cloroplasto" position={[c.position[0], c.position[1] + 2.3, c.position[2]]} accent="#43a047" small />
      ))}
      {MITOCHONDRIA.slice(1).map((m, i) => (
        <Label key={`mi${i}`} text="Mitocondria" position={[m.position[0], m.position[1] + 2.2, m.position[2]]} accent="#ff8a65" small />
      ))}
    </group>
  );
}
