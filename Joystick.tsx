import { useRef, useState } from "react";
import { input } from "../input";

const RADIUS = 52;

export function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef<number | null>(null);

  const update = (clientX: number, clientY: number) => {
    const el = base.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let dx = clientX - (r.left + r.width / 2);
    let dy = clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    input.joy.x = dx / RADIUS;
    input.joy.y = dy / RADIUS;
  };

  const end = () => {
    active.current = null;
    setKnob({ x: 0, y: 0 });
    input.joy.x = 0;
    input.joy.y = 0;
  };

  return (
    <div
      ref={base}
      className="relative h-36 w-36 rounded-full bg-slate-950/50 border-2 border-white/25 backdrop-blur-md touch-none select-none"
      onPointerDown={(e) => {
        active.current = e.pointerId;
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (active.current === e.pointerId) update(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs font-bold pointer-events-none">
        <span className="absolute top-2">▲</span>
        <span className="absolute bottom-2">▼</span>
        <span className="absolute left-2">◀</span>
        <span className="absolute right-2">▶</span>
      </div>
      <div
        className="absolute left-1/2 top-1/2 h-14 w-14 -ml-7 -mt-7 rounded-full bg-lime-300/90 shadow-lg pointer-events-none"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}
