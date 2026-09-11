import { Billboard } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ORDER, ORGANELLES, Organelle } from "../data/organelles";
import { selectBlocked, useGame } from "../store";
import { TextPlane } from "./TextPlane";

type Status = "locked" | "active" | "done" | "free";

const COLORS: Record<Status, string> = {
  locked: "#90a4ae",
  active: "#ffd54f",
  done: "#66bb6a",
  free: "#4fc3f7",
};

function Beacon({ org, status }: { org: Organelle; status: Status }) {
  const ring = useRef<THREE.Mesh>(null);
  const beam = useRef<THREE.Mesh>(null);
  const marker = useRef<THREE.Group>(null);
  const color = COLORS[status];
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring.current) {
      const s = status === "active" ? 1 + Math.sin(t * 3) * 0.08 : 1;
      ring.current.scale.set(s, s, 1);
    }
    if (beam.current) {
      const m = beam.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.12 + Math.sin(t * 2.5) * 0.06;
      beam.current.rotation.y = t * 0.4;
    }
    if (marker.current) marker.current.position.y = 2.4 + Math.sin(t * 2 + org.order) * 0.12;
  });
  const label =
    status === "done" ? "✓" : status === "locked" ? "🔒" : String(org.order);
  return (
    <group position={org.checkpoint}>
      {/* anillo */}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <torusGeometry args={[1.6, 0.07, 10, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={status === "locked" ? 0.1 : 0.8}
          transparent
          opacity={status === "locked" ? 0.45 : 1}
        />
      </mesh>
      {/* disco */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} renderOrder={2}>
        <circleGeometry args={[1.6, 40]} />
        <meshBasicMaterial color={color} transparent opacity={status === "locked" ? 0.08 : 0.22} depthWrite={false} />
      </mesh>
      {/* haz de luz (solo activo) */}
      {status === "active" && (
        <mesh ref={beam} position={[0, 7, 0]} renderOrder={3}>
          <cylinderGeometry args={[0.9, 1.4, 14, 24, 1, true]} />
          <meshBasicMaterial
            color="#ffe082"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      {/* marcador numerado */}
      <group ref={marker} position={[0, 2.4, 0]}>
        <Billboard>
          <TextPlane
            text={label}
            fontSize={64}
            weight="800"
            color={status === "locked" ? "#eceff1" : "#1b2a1e"}
            bg={color}
            padding={18}
            radius={60}
            minWidth={100}
            scale={1 / 130}
            renderOrder={21}
          />
          {status === "active" && (
            <TextPlane
              text="➜ Objetivo actual"
              fontSize={40}
              weight="700"
              color="#1b2a1e"
              bg="rgba(255, 236, 179, 0.95)"
              padding={14}
              radius={20}
              scale={1 / 150}
              position={[0, 0.95, 0]}
              renderOrder={21}
            />
          )}
        </Billboard>
      </group>
    </group>
  );
}

export function Checkpoints() {
  const camera = useThree((s) => s.camera);
  const phase = useGame((s) => s.phase);
  const currentIndex = useGame((s) => s.currentIndex);
  const completed = useGame((s) => s.completed);
  const inside = useRef<Record<string, boolean>>({});
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const lastNear = useRef<number>(0);

  useFrame(({ clock }) => {
    const s = useGame.getState();
    if (s.phase !== "playing" && s.phase !== "free") return;
    camera.getWorldPosition(tmp);
    const blocked = selectBlocked(s);
    let nearCompleted: string | null = null;
    let nearDist = Infinity;
    for (const o of ORGANELLES) {
      const dx = tmp.x - o.checkpoint[0];
      const dz = tmp.z - o.checkpoint[2];
      const d = Math.sqrt(dx * dx + dz * dz);
      const isInside = d < 2.1;
      const was = inside.current[o.id] ?? false;
      inside.current[o.id] = isInside;
      if (blocked) continue;
      const isTarget = s.phase === "playing" && ORDER[s.currentIndex] === o.id;
      if (isInside && !was) {
        if (isTarget || s.phase === "free") s.openCheckpoint(o.id);
      }
      if (s.phase === "playing" && s.completed[o.id] && d < 2.6 && d < nearDist) {
        nearDist = d;
        nearCompleted = o.id;
      }
    }
    // actualizar "cerca de un checkpoint completado" (máx. 5 veces/s)
    const t = clock.getElapsedTime();
    if (t - lastNear.current > 0.2) {
      lastNear.current = t;
      s.setNearCompleted(nearCompleted);
    }
  });

  return (
    <group>
      {ORGANELLES.map((o) => {
        let status: Status = "locked";
        if (completed[o.id]) status = "done";
        else if (phase === "playing" && ORDER[currentIndex] === o.id) status = "active";
        else if (phase === "free" || phase === "results") status = "free";
        return <Beacon key={o.id} org={o} status={status} />;
      })}
    </group>
  );
}
