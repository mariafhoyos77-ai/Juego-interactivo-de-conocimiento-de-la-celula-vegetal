import { useFrame, useThree } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { usePanelModel, PanelModel } from "../usePanelModel";
import { makeTextTexture, TextTextureResult } from "./TextPlane";

const S = 1 / 1000; // metros por píxel
const CONTENT_W = 1240; // px
const PANEL_W = 1.36; // m
const LETTERS = ["A", "B", "C", "D", "E"];

interface Built {
  badge?: TextTextureResult;
  title: TextTextureResult;
  subtitle?: TextTextureResult;
  body?: TextTextureResult;
  options: { tex: TextTextureResult; state: string; onClick: () => void }[];
  buttons: { tex: TextTextureResult; onClick: () => void; variant: string }[];
  totalH: number;
}

function build(model: PanelModel): Built {
  const badge = model.badge
    ? makeTextTexture({ text: model.badge, fontSize: 26, weight: "700", color: "#1b2a1e", bg: model.accent, padding: 12, radius: 20 })
    : undefined;
  const title = makeTextTexture({
    text: (model.emoji ? model.emoji + " " : "") + model.title,
    fontSize: 42,
    weight: "800",
    color: "#ffffff",
    bg: null,
    padding: 8,
    maxWidth: CONTENT_W,
    align: "left",
  });
  const subtitle = model.subtitle
    ? makeTextTexture({ text: model.subtitle, fontSize: 28, weight: "600", color: "#cbd5e1", bg: null, padding: 6, maxWidth: CONTENT_W, align: "left" })
    : undefined;
  const body =
    model.body.length > 0
      ? makeTextTexture({ text: model.body.join("\n\n"), fontSize: 29, weight: "500", color: "#e2e8f0", bg: null, padding: 8, maxWidth: CONTENT_W, align: "left", lineHeight: 1.3 })
      : undefined;
  const options = (model.options ?? []).map((o, i) => ({
    tex: makeTextTexture({
      text: `${LETTERS[i]}.  ${o.label}`,
      fontSize: 30,
      weight: "600",
      color: o.state === "disabled" ? "#94a3b8" : "#ffffff",
      bg: null,
      padding: 18,
      maxWidth: CONTENT_W,
      align: "left",
      minWidth: CONTENT_W,
    }),
    state: o.state,
    onClick: o.onClick,
  }));
  const buttons = model.buttons.map((b) => ({
    tex: makeTextTexture({
      text: b.label,
      fontSize: 34,
      weight: "800",
      color: b.variant === "primary" ? "#1b2a1e" : "#ffffff",
      bg: null,
      padding: 20,
      minWidth: 420,
    }),
    onClick: b.onClick,
    variant: b.variant,
  }));
  let h = 0.08;
  if (badge) h += badge.height * S + 0.03;
  h += title.height * S + 0.02;
  if (subtitle) h += subtitle.height * S + 0.02;
  if (body) h += body.height * S + 0.03;
  for (const o of options) h += o.tex.height * S + 0.018;
  if (buttons.length) h += 0.03 + Math.max(...buttons.map((b) => b.tex.height * S)) + 0.02;
  h += 0.05;
  return { badge, title, subtitle, body, options, buttons, totalH: h };
}

function Tex({ tex, position, z = 0.003, align = "left" }: { tex: TextTextureResult; position: [number, number]; z?: number; align?: "left" | "center" }) {
  const w = tex.width * S;
  const h = tex.height * S;
  const x = align === "left" ? position[0] + w / 2 : position[0];
  return (
    <mesh position={[x, position[1] - h / 2, z]} renderOrder={31}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex.texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

const OPTION_COLORS: Record<string, string> = {
  idle: "#27476b",
  hover: "#3b6ea3",
  disabled: "#2b3440",
  correct: "#2e7d32",
  wrong: "#b3261e",
};

export function VRPanel() {
  const session = useXR((s) => s.session);
  const model = usePanelModel();
  const camera = useThree((s) => s.camera);
  const group = useRef<THREE.Group>(null);
  const placedKey = useRef<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const built = useMemo(() => (model && session ? build(model) : null), [model, session]);
  useEffect(() => {
    if (!built) return;
    return () => {
      built.badge?.texture.dispose();
      built.title.texture.dispose();
      built.subtitle?.texture.dispose();
      built.body?.texture.dispose();
      built.options.forEach((o) => o.tex.texture.dispose());
      built.buttons.forEach((b) => b.tex.texture.dispose());
    };
  }, [built]);

  useFrame(() => {
    if (!group.current || !model || !session) return;
    const kind = model.tone + ":" + model.key.split("-")[0];
    if (placedKey.current === kind) return;
    placedKey.current = kind;
    const pos = camera.getWorldPosition(new THREE.Vector3());
    const dir = camera.getWorldDirection(new THREE.Vector3());
    dir.y = 0;
    if (dir.lengthSq() < 1e-4) dir.set(0, 0, -1);
    dir.normalize();
    group.current.position.set(pos.x + dir.x * 1.7, pos.y - 0.05, pos.z + dir.z * 1.7);
    group.current.rotation.set(0, Math.atan2(-dir.x, -dir.z), 0);
  });

  useEffect(() => {
    if (!model) placedKey.current = null;
  }, [model]);

  if (!built || !model || !session) return null;

  const left = -CONTENT_W * S * 0.5;
  let y = built.totalH / 2 - 0.05;
  const rows: React.ReactNode[] = [];
  if (built.badge) {
    rows.push(<Tex key="badge" tex={built.badge} position={[left, y]} />);
    y -= built.badge.height * S + 0.03;
  }
  rows.push(<Tex key="title" tex={built.title} position={[left, y]} />);
  y -= built.title.height * S + 0.02;
  if (built.subtitle) {
    rows.push(<Tex key="sub" tex={built.subtitle} position={[left, y]} />);
    y -= built.subtitle.height * S + 0.02;
  }
  if (built.body) {
    rows.push(<Tex key="body" tex={built.body} position={[left, y]} />);
    y -= built.body.height * S + 0.03;
  }
  built.options.forEach((o, i) => {
    const h = o.tex.height * S;
    const w = CONTENT_W * S;
    const id = `opt${i}`;
    const interactive = o.state === "idle";
    const color = hover === id && interactive ? OPTION_COLORS.hover : OPTION_COLORS[o.state] ?? OPTION_COLORS.idle;
    rows.push(
      <group key={id}>
        <mesh
          position={[0, y - h / 2, 0.002]}
          renderOrder={30}
          onClick={(e) => {
            e.stopPropagation();
            if (interactive) o.onClick();
          }}
          onPointerOver={() => setHover(id)}
          onPointerOut={() => setHover((h) => (h === id ? null : h))}
        >
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color={color} transparent opacity={0.95} depthWrite={false} toneMapped={false} />
        </mesh>
        <Tex tex={o.tex} position={[left, y]} z={0.004} />
      </group>
    );
    y -= h + 0.018;
  });
  if (built.buttons.length) {
    y -= 0.03;
    const totalW = built.buttons.reduce((a, b) => a + b.tex.width * S + 0.04, -0.04);
    let bx = -totalW / 2;
    built.buttons.forEach((b, i) => {
      const w = b.tex.width * S;
      const h = b.tex.height * S;
      const id = `btn${i}`;
      const base = b.variant === "primary" ? "#f59e0b" : "#475569";
      const hov = b.variant === "primary" ? "#fbbf24" : "#64748b";
      rows.push(
        <group key={id}>
          <mesh
            position={[bx + w / 2, y - h / 2, 0.002]}
            renderOrder={30}
            onClick={(e) => {
              e.stopPropagation();
              b.onClick();
            }}
            onPointerOver={() => setHover(id)}
            onPointerOut={() => setHover((h) => (h === id ? null : h))}
          >
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial color={hover === id ? hov : base} depthWrite={false} toneMapped={false} />
          </mesh>
          <Tex tex={b.tex} position={[bx + w / 2, y]} z={0.004} align="center" />
        </group>
      );
      bx += w + 0.04;
    });
  }

  return (
    <group ref={group}>
      <mesh renderOrder={29}>
        <planeGeometry args={[PANEL_W, built.totalH]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.93} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, built.totalH / 2 - 0.004, 0.001]} renderOrder={30}>
        <planeGeometry args={[PANEL_W, 0.012]} />
        <meshBasicMaterial color={model.accent} toneMapped={false} />
      </mesh>
      {rows}
    </group>
  );
}
