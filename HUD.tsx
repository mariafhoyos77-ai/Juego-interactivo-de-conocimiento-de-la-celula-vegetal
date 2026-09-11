import { useEffect, useState } from "react";
import { BY_ID, ORDER, ORGANELLES } from "../data/organelles";
import { selectBlocked, useGame } from "../store";
import { requestLock } from "../three/Player";
import { formatTime } from "../usePanelModel";
import { checkVRSupport, xrStore } from "../xrStore";
import { cn } from "../utils/cn";
import { Joystick } from "./Joystick";
import { Minimap } from "./Minimap";
import { ControlsHelp } from "./StartScreen";

function Timer() {
  const startedAt = useGame((s) => s.startedAt);
  const finishedAt = useGame((s) => s.finishedAt);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{formatTime((finishedAt || now) - startedAt)}</span>;
}

function Compass() {
  const player = useGame((s) => s.player);
  const currentIndex = useGame((s) => s.currentIndex);
  const phase = useGame((s) => s.phase);
  if (phase !== "playing") return null;
  const target = BY_ID[ORDER[currentIndex]];
  if (!target) return null;
  const dx = target.checkpoint[0] - player.x;
  const dz = target.checkpoint[2] - player.z;
  const dist = Math.hypot(dx, dz);
  const rel = Math.atan2(dx, -dz) + player.yaw;
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 rounded-full bg-white/10 border border-white/15 grid place-items-center">
        <div className="text-2xl transition-transform" style={{ transform: `rotate(${rel}rad)` }}>
          ⬆️
        </div>
      </div>
      <div className="text-xs text-white/70">
        <div>Distancia</div>
        <div className="text-base font-black text-white">{dist < 2.2 ? "¡Aquí!" : `≈ ${dist.toFixed(0)} µm`}</div>
      </div>
    </div>
  );
}

function IconButton({ onClick, title, children, active }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "h-10 w-10 rounded-xl border border-white/15 bg-slate-950/60 backdrop-blur-md hover:bg-white/15 transition text-lg grid place-items-center",
        active && "bg-lime-400/30 border-lime-300/50"
      )}
    >
      {children}
    </button>
  );
}

function Notebook() {
  const completed = useGame((s) => s.completed);
  const currentIndex = useGame((s) => s.currentIndex);
  const phase = useGame((s) => s.phase);
  const setOpen = useGame((s) => s.setNotebookOpen);
  const openReview = useGame((s) => s.openReview);
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-3xl bg-slate-950/90 border border-white/15 p-6 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black">📓 Cuaderno de campo</h3>
          <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-1 bg-white/10 hover:bg-white/20">Cerrar</button>
        </div>
        <p className="text-xs text-white/60 mt-1">Toca un orgánulo completado para repasar su información.</p>
        <ul className="mt-4 space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {ORGANELLES.map((o) => {
            const c = completed[o.id];
            const isCurrent = phase === "playing" && ORDER[currentIndex] === o.id;
            const canOpen = !!c || phase === "free";
            return (
              <li key={o.id}>
                <button
                  disabled={!canOpen}
                  onClick={() => {
                    setOpen(false);
                    openReview(o.id);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left border transition",
                    c ? "bg-emerald-500/15 border-emerald-300/30 hover:bg-emerald-500/25" : isCurrent ? "bg-amber-400/15 border-amber-300/40" : "bg-white/5 border-white/5 opacity-60",
                    !canOpen && "cursor-default"
                  )}
                >
                  <span className="h-7 w-7 rounded-full grid place-items-center text-xs font-black text-slate-900" style={{ background: o.color }}>
                    {o.order}
                  </span>
                  <span className="flex-1">
                    <span className="font-bold">{o.emoji} {o.name}</span>
                    <span className="block text-xs text-white/60">
                      {c ? `✓ Completado · ${c.points} pts${c.attempts ? ` · ${c.attempts} fallo(s)` : " · ¡al primer intento!"}` : isCurrent ? "➜ Objetivo actual" : phase === "free" ? "Disponible" : "🔒 Bloqueado"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Help() {
  const setOpen = useGame((s) => s.setHelpOpen);
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-2xl rounded-3xl bg-slate-950/90 border border-white/15 p-6 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black">❔ Controles y objetivo</h3>
          <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-1 bg-white/10 hover:bg-white/20">Cerrar</button>
        </div>
        <p className="text-sm text-emerald-50/90 mb-4">
          Sigue la <b>flecha de la brújula</b> y el <b>haz de luz amarillo</b> hasta la baliza numerada. Al entrar en ella
          leerás la información del orgánulo y responderás una pregunta. Aciertas al primer intento: 100 puntos; al
          segundo: 50; después: 25. Puedes volver a leer cualquier orgánulo completado desde el cuaderno o pulsando <b>E</b> junto a su baliza.
        </p>
        <ControlsHelp />
      </div>
    </div>
  );
}

export function HUD() {
  const phase = useGame((s) => s.phase);
  const currentIndex = useGame((s) => s.currentIndex);
  const completedCount = useGame((s) => Object.keys(s.completed).length);
  const score = useGame((s) => s.score);
  const muted = useGame((s) => s.muted);
  const toggleMute = useGame((s) => s.toggleMute);
  const isTouch = useGame((s) => s.isTouch);
  const locked = useGame((s) => s.locked);
  const lockUnavailable = useGame((s) => s.lockUnavailable);
  const xrActive = useGame((s) => s.xrActive);
  const helpOpen = useGame((s) => s.helpOpen);
  const notebookOpen = useGame((s) => s.notebookOpen);
  const setHelpOpen = useGame((s) => s.setHelpOpen);
  const setNotebookOpen = useGame((s) => s.setNotebookOpen);
  const nearCompleted = useGame((s) => s.nearCompleted);
  const openReview = useGame((s) => s.openReview);
  const blocked = useGame(selectBlocked);
  const [vr, setVr] = useState(false);
  useEffect(() => {
    checkVRSupport().then(setVr);
  }, []);

  const target = phase === "playing" ? BY_ID[ORDER[currentIndex]] : null;
  const exploring = phase === "playing" || phase === "free";
  const showLockOverlay = !isTouch && !xrActive && !locked && !lockUnavailable && !blocked && exploring;
  const dragMode = !isTouch && !xrActive && !locked && lockUnavailable && !blocked && exploring;

  return (
    <>
      {/* Barra superior izquierda: misión */}
      <div className="absolute top-3 left-3 z-20 max-w-[min(92vw,360px)]">
        <div className="rounded-2xl bg-slate-950/65 border border-white/10 backdrop-blur-md text-white p-3 shadow-xl">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span className="font-bold uppercase tracking-wider">
              {phase === "free" ? "Exploración libre" : `Misión ${Math.min(currentIndex + 1, ORDER.length)} de ${ORDER.length}`}
            </span>
            <span>{completedCount}/{ORDER.length} ✓</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 transition-all" style={{ width: `${(completedCount / ORDER.length) * 100}%` }} />
          </div>
          {target ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-9 w-9 shrink-0 rounded-full grid place-items-center text-lg" style={{ background: target.color + "33", boxShadow: `inset 0 0 0 2px ${target.color}` }}>
                  {target.emoji}
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] text-white/60">Ve hacia la baliza {target.order}</div>
                  <div className="font-black leading-tight truncate">{target.name}</div>
                </div>
              </div>
              <Compass />
            </div>
          ) : (
            <div className="mt-2 text-sm text-emerald-100/90">
              {phase === "free" ? "Acércate a cualquier baliza para repasar el orgánulo." : "¡Todos los checkpoints completados!"}
            </div>
          )}
        </div>
      </div>

      {/* Barra superior derecha: puntaje y botones */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
        <div className="rounded-2xl bg-slate-950/65 border border-white/10 backdrop-blur-md text-white px-4 py-2 shadow-xl flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-white/60">Puntos</div>
            <div className="text-xl font-black text-amber-300 leading-none">{score}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-white/60">Tiempo</div>
            <div className="text-xl font-black leading-none tabular-nums">
              <Timer />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <IconButton onClick={toggleMute} title={muted ? "Activar sonido" : "Silenciar"}>{muted ? "🔇" : "🔊"}</IconButton>
          <IconButton onClick={() => setNotebookOpen(true)} title="Cuaderno de campo" active={notebookOpen}>📓</IconButton>
          <IconButton onClick={() => setHelpOpen(true)} title="Ayuda y controles" active={helpOpen}>❔</IconButton>
          {vr && !xrActive && (
            <IconButton onClick={() => void xrStore.enterVR()} title="Entrar en realidad virtual">🥽</IconButton>
          )}
        </div>
      </div>

      {/* Minimapa */}
      <div className="absolute bottom-3 right-3 z-20 hidden sm:block">
        <Minimap />
      </div>

      {/* Mira */}
      {!isTouch && !xrActive && !blocked && (
        <div className="absolute left-1/2 top-1/2 z-10 -ml-1 -mt-1 h-2 w-2 rounded-full bg-white/80 ring-2 ring-slate-900/40 pointer-events-none" />
      )}

      {/* Repasar checkpoint completado */}
      {nearCompleted && !blocked && (
        <div className="absolute bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-20">
          {isTouch ? (
            <button onClick={() => openReview(nearCompleted)} className="rounded-full bg-emerald-400 text-emerald-950 font-black px-5 py-2.5 shadow-lg">
              📖 Repasar {BY_ID[nearCompleted].name}
            </button>
          ) : (
            <div className="rounded-full bg-slate-950/70 border border-white/15 text-white px-4 py-2 text-sm backdrop-blur-md">
              Pulsa <kbd className="rounded bg-white/20 px-1.5 font-black">E</kbd> para repasar <b>{BY_ID[nearCompleted].name}</b>
            </div>
          )}
        </div>
      )}

      {/* Ayuda de controles (escritorio) */}
      {!isTouch && !xrActive && locked && !blocked && !nearCompleted && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-[11px] text-white/70 bg-slate-950/50 rounded-full px-3 py-1 backdrop-blur-md pointer-events-none">
          WASD moverse · Ratón mirar · Shift correr · N cuaderno · H ayuda · Esc liberar ratón
        </div>
      )}
      {dragMode && !nearCompleted && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-xs text-white bg-slate-950/70 border border-white/15 rounded-full px-4 py-1.5 backdrop-blur-md pointer-events-none">
          🖱️ Mantén pulsado y <b>arrastra</b> para mirar · <b>WASD</b> moverse · <b>Shift</b> correr
        </div>
      )}

      {/* Joystick táctil */}
      {isTouch && !xrActive && !blocked && (
        <div className="absolute bottom-5 left-5 z-10">
          <Joystick />
        </div>
      )}
      {isTouch && !xrActive && !blocked && (
        <div className="absolute bottom-5 right-5 z-10 text-[11px] text-white/70 bg-slate-950/50 rounded-full px-3 py-1 backdrop-blur-md pointer-events-none sm:hidden">
          Arrastra aquí para mirar 👆
        </div>
      )}

      {/* Capa "haz clic para explorar" */}
      {showLockOverlay && (
        <button
          onClick={() => {
            const canvas = document.querySelector("canvas");
            if (canvas) requestLock(canvas);
          }}
          className="absolute inset-0 z-10 bg-slate-950/35 backdrop-blur-[1px] grid place-items-center cursor-pointer"
        >
          <div className="rounded-3xl bg-slate-950/80 border border-white/15 px-8 py-6 text-center text-white shadow-2xl">
            <div className="text-3xl mb-2">🖱️</div>
            <div className="text-xl font-black">Haz clic para explorar</div>
            <div className="text-sm text-white/70 mt-1">WASD para caminar · mueve el ratón para mirar · Shift para correr</div>
          </div>
        </button>
      )}

      {notebookOpen && <Notebook />}
      {helpOpen && <Help />}
    </>
  );
}
