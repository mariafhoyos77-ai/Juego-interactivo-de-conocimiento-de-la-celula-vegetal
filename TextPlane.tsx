import { Billboard } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

export interface TextTextureOptions {
  text: string;
  fontSize?: number;
  color?: string;
  bg?: string | null;
  padding?: number;
  maxWidth?: number;
  weight?: string;
  align?: "left" | "center";
  radius?: number;
  lineHeight?: number;
  border?: string | null;
  minWidth?: number;
}

export interface TextTextureResult {
  texture: THREE.CanvasTexture;
  width: number;
  height: number;
}

function wrapLines(
  c: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const out: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(" ");
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (c.measureText(test).width > maxWidth && line) {
        out.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    out.push(line);
  }
  return out;
}

function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + rr, y);
  c.lineTo(x + w - rr, y);
  c.quadraticCurveTo(x + w, y, x + w, y + rr);
  c.lineTo(x + w, y + h - rr);
  c.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  c.lineTo(x + rr, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - rr);
  c.lineTo(x, y + rr);
  c.quadraticCurveTo(x, y, x + rr, y);
  c.closePath();
}

export function makeTextTexture(opts: TextTextureOptions): TextTextureResult {
  const {
    text,
    fontSize = 48,
    color = "#ffffff",
    bg = "rgba(15, 23, 42, 0.85)",
    padding = 24,
    maxWidth = 900,
    weight = "600",
    align = "center",
    radius = 28,
    lineHeight = 1.25,
    border = null,
    minWidth = 0,
  } = opts;
  const canvas = document.createElement("canvas");
  const c = canvas.getContext("2d")!;
  const font = `${weight} ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  c.font = font;
  const lines = wrapLines(c, text, maxWidth - padding * 2);
  const textWidth = Math.max(...lines.map((l) => c.measureText(l).width), 1);
  const lh = fontSize * lineHeight;
  const width = Math.ceil(Math.max(minWidth, textWidth + padding * 2));
  const height = Math.ceil(lines.length * lh + padding * 2);
  canvas.width = width;
  canvas.height = height;
  c.font = font;
  if (bg) {
    c.fillStyle = bg;
    roundRect(c, 0, 0, width, height, radius);
    c.fill();
  }
  if (border) {
    c.strokeStyle = border;
    c.lineWidth = 4;
    roundRect(c, 2, 2, width - 4, height - 4, radius);
    c.stroke();
  }
  c.fillStyle = color;
  c.textBaseline = "middle";
  c.textAlign = align;
  lines.forEach((line, i) => {
    const x = align === "center" ? width / 2 : padding;
    const y = padding + lh * i + lh / 2;
    c.fillText(line, x, y);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return { texture, width, height };
}

interface TextPlaneProps extends TextTextureOptions {
  /** metros por píxel */
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  renderOrder?: number;
  depthTest?: boolean;
  opacity?: number;
  onClick?: (e: unknown) => void;
  onPointerOver?: (e: unknown) => void;
  onPointerOut?: (e: unknown) => void;
}

export function TextPlane({
  scale = 1 / 160,
  position,
  rotation,
  renderOrder = 10,
  depthTest = true,
  opacity = 1,
  onClick,
  onPointerOver,
  onPointerOut,
  ...textOpts
}: TextPlaneProps) {
  const {
    text,
    fontSize,
    color,
    bg,
    padding,
    maxWidth,
    weight,
    align,
    radius,
    lineHeight,
    border,
    minWidth,
  } = textOpts;
  const result = useMemo(
    () =>
      makeTextTexture({
        text,
        fontSize,
        color,
        bg,
        padding,
        maxWidth,
        weight,
        align,
        radius,
        lineHeight,
        border,
        minWidth,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, fontSize, color, bg, padding, maxWidth, weight, align, radius, lineHeight, border, minWidth]
  );
  useEffect(() => () => result.texture.dispose(), [result]);
  return (
    <mesh
      position={position}
      rotation={rotation}
      renderOrder={renderOrder}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <planeGeometry args={[result.width * scale, result.height * scale]} />
      <meshBasicMaterial
        map={result.texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        depthTest={depthTest}
        toneMapped={false}
        fog={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface LabelProps {
  text: string;
  position: [number, number, number];
  color?: string;
  accent?: string;
  size?: number;
  small?: boolean;
}

/** Etiqueta flotante que siempre mira a la cámara (funciona en VR). */
export function Label({ text, position, color = "#ffffff", accent, size = 1, small }: LabelProps) {
  return (
    <Billboard position={position} follow lockX={false} lockY={false} lockZ={false}>
      <TextPlane
        text={text}
        fontSize={small ? 40 : 52}
        weight="700"
        color={color}
        bg="rgba(20, 35, 25, 0.82)"
        border={accent ?? null}
        padding={small ? 16 : 22}
        radius={30}
        scale={(small ? 1 / 200 : 1 / 150) * size}
        renderOrder={20}
      />
    </Billboard>
  );
}
