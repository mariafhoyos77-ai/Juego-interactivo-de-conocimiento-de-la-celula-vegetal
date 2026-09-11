import { CHLOROPLASTS, MITOCHONDRIA, ORDER, ORGANELLES } from "../data/organelles";
import { useGame } from "../store";

const SIZE = 150;
const K = SIZE / 66;
const mx = (x: number) => SIZE / 2 + x * K;
const mz = (z: number) => SIZE / 2 + z * K;

export function Minimap() {
  const player = useGame((s) => s.player);
  const completed = useGame((s) => s.completed);
  const currentIndex = useGame((s) => s.currentIndex);
  const phase = useGame((s) => s.phase);
  const target = phase === "playing" ? ORDER[currentIndex] : null;
  const heading = (-player.yaw * 180) / Math.PI;

  return (
    <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-2 backdrop-blur-md shadow-xl">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <rect x={mx(-32)} y={mz(-32)} width={64 * K} height={64 * K} rx={18} fill="#7cb342" opacity={0.35} stroke="#c5e1a5" strokeWidth={2} />
        <rect x={mx(-30.5)} y={mz(-30.5)} width={61 * K} height={61 * K} rx={16} fill="#dce775" opacity={0.15} />
        {/* vacuola */}
        <ellipse cx={mx(0)} cy={mz(0)} rx={9 * K} ry={9.9 * K} fill="#4fc3f7" opacity={0.45} />
        {/* núcleo */}
        <circle cx={mx(-19)} cy={mz(-13)} r={5 * K} fill="#b0bec5" opacity={0.6} />
        <circle cx={mx(-18.2)} cy={mz(-12.4)} r={1.6 * K} fill="#8d6e63" opacity={0.8} />
        {/* RE rugoso */}
        <path
          d={`M ${mx(-11.4)} ${mz(-6.6)} A ${9 * K} ${9 * K} 0 0 0 ${mx(-11.4)} ${mz(-19.4)}`}
          fill="none"
          stroke="#66bb6a"
          strokeWidth={3}
          opacity={0.8}
        />
        {/* golgi */}
        <ellipse cx={mx(15)} cy={mz(13)} rx={2.6 * K} ry={1.7 * K} fill="#ffab91" opacity={0.8} />
        {/* RE liso */}
        <circle cx={mx(-14)} cy={mz(2)} r={2.8 * K} fill="#ffcc80" opacity={0.6} />
        {CHLOROPLASTS.map((c, i) => (
          <ellipse key={`c${i}`} cx={mx(c.position[0])} cy={mz(c.position[2])} rx={2.1 * K} ry={1.2 * K} fill="#43a047" opacity={0.85} transform={`rotate(${(-c.rotation * 180) / Math.PI} ${mx(c.position[0])} ${mz(c.position[2])})`} />
        ))}
        {MITOCHONDRIA.map((m, i) => (
          <ellipse key={`m${i}`} cx={mx(m.position[0])} cy={mz(m.position[2])} rx={2.1 * K} ry={1 * K} fill="#ff8a65" opacity={0.85} transform={`rotate(${(-m.rotation * 180) / Math.PI} ${mx(m.position[0])} ${mz(m.position[2])})`} />
        ))}
        {/* checkpoints */}
        {ORGANELLES.map((o) => {
          const done = !!completed[o.id];
          const isTarget = target === o.id;
          const fill = done ? "#66bb6a" : isTarget ? "#ffd54f" : phase === "free" ? "#4fc3f7" : "#90a4ae";
          return (
            <g key={o.id}>
              {isTarget && (
                <circle cx={mx(o.checkpoint[0])} cy={mz(o.checkpoint[2])} r={7} fill="none" stroke="#ffd54f" strokeWidth={2}>
                  <animate attributeName="r" values="5;10;5" dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={mx(o.checkpoint[0])} cy={mz(o.checkpoint[2])} r={4} fill={fill} stroke="#0f172a" strokeWidth={1} />
              <text x={mx(o.checkpoint[0])} y={mz(o.checkpoint[2]) + 2.5} fontSize={6} textAnchor="middle" fill="#0f172a" fontWeight={800}>
                {done ? "✓" : o.order}
              </text>
            </g>
          );
        })}
        {/* jugador */}
        <g transform={`translate(${mx(player.x)} ${mz(player.z)}) rotate(${heading})`}>
          <path d="M 0 -7 L 5 5 L 0 2.5 L -5 5 Z" fill="#ffffff" stroke="#0f172a" strokeWidth={1} />
        </g>
      </svg>
      <div className="text-[10px] text-center text-white/60 mt-1">Mapa de la célula</div>
    </div>
  );
}
