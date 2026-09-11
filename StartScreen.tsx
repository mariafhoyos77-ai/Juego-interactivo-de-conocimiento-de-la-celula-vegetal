import { useEffect, useState } from "react";
import { ORGANELLES, START_POSITION } from "../data/organelles";
import { resetInput } from "../input";
import { useGame } from "../store";
import { requestLock } from "../three/Player";
import { checkVRSupport, xrStore } from "../xrStore";

export function ControlsHelp() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 text-sm">
      <div className="rounded-xl bg-white/10 p-3">
        <div className="text-lg mb-1">🖥️ Computador</div>
        <ul className="space-y-1 text-emerald-50/90">
          <li><b>Clic</b> en la pantalla para activar el ratón</li>
          <li><b>W A S D</b> o flechas: caminar</li>
          <li><b>Ratón</b>: mirar alrededor</li>
          <li><b>Shift</b>: correr · <b>E</b>: repasar</li>
          <li><b>Esc</b>: liberar el ratón</li>
        </ul>
      </div>
      <div className="rounded-xl bg-white/10 p-3">
        <div className="text-lg mb-1">📱 Móvil / tablet</div>
        <ul className="space-y-1 text-emerald-50/90">
          <li><b>Joystick</b> (abajo izquierda): caminar</li>
          <li><b>Arrastra</b> en la parte derecha: mirar</li>
          <li>Toca el botón <b>Repasar</b> cerca de una baliza verde</li>
        </ul>
      </div>
      <div className="rounded-xl bg-white/10 p-3">
        <div className="text-lg mb-1">🥽 Realidad virtual</div>
        <ul className="space-y-1 text-emerald-50/90">
          <li><b>Joystick izquierdo</b>: caminar</li>
          <li><b>Joystick derecho</b>: girar 45°</li>
          <li><b>Gatillo</b>: pulsar botones del panel flotante</li>
          <li>Compatible con Meta Quest, Pico y WebXR</li>
        </ul>
      </div>
    </div>
  );
}

export function StartScreen() {
  const start = useGame((s) => s.start);
  const [name, setName] = useState(useGame.getState().playerName);
  const [vr, setVr] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const isTouch = useGame((s) => s.isTouch);

  useEffect(() => {
    checkVRSupport().then(setVr);
  }, []);

  const begin = (mode: "screen" | "vr") => {
    resetInput(START_POSITION.x, START_POSITION.z);
    start(name);
    if (mode === "vr") {
      void xrStore.enterVR();
    } else if (!isTouch) {
      const canvas = document.querySelector("canvas");
      if (canvas) requestLock(canvas);
    }
  };

  return (
    <div className="absolute inset-0 overflow-y-auto bg-gradient-to-br from-emerald-950/90 via-emerald-900/75 to-lime-900/70 backdrop-blur-[2px] text-white">
      <div className="min-h-full flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl">
          <div className="rounded-3xl bg-slate-950/60 border border-white/10 shadow-2xl p-6 sm:p-10 backdrop-blur-md">
            <div className="flex items-center gap-3 text-lime-300 font-semibold tracking-widest text-xs uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
              Juego educativo de biología · Realidad virtual
            </div>
            <h1 className="mt-3 text-4xl sm:text-6xl font-black leading-tight">
              CéluLab <span className="text-lime-300">VR</span>
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-100 mt-1">
              Expedición al interior de la célula vegetal
            </h2>
            <p className="mt-4 text-emerald-50/90 leading-relaxed">
              Conviértete en un explorador microscópico. Camina entre la vacuola, el núcleo, los cloroplastos y las
              demás partes de la célula vegetal. Visita los <b>{ORGANELLES.length} checkpoints</b> en orden, lee la
              información de cada orgánulo y responde correctamente las preguntas para ganar puntos. Al final te
              espera un <b>examen</b> para demostrar todo lo que aprendiste.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {ORGANELLES.map((o) => (
                <span
                  key={o.id}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-white/10 border border-white/10"
                  style={{ boxShadow: `inset 0 0 0 1px ${o.color}55` }}
                >
                  <span style={{ color: o.color }}>{o.order}</span> {o.emoji} {o.short}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] items-end">
              <label className="block">
                <span className="text-sm text-emerald-100/80">Tu nombre (opcional)</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej.: Valentina"
                  maxLength={24}
                  className="mt-1 w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 outline-none focus:ring-2 focus:ring-lime-400/70 placeholder:text-white/40"
                />
              </label>
              <button
                onClick={() => begin("screen")}
                className="rounded-xl bg-lime-400 hover:bg-lime-300 active:scale-[0.98] text-emerald-950 font-black px-6 py-3 text-lg shadow-lg shadow-lime-500/30 transition"
              >
                🚀 Iniciar expedición
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-3 items-center">
              <button
                onClick={() => begin("vr")}
                disabled={!vr}
                title={vr ? "Entrar con tu visor de realidad virtual" : "No se detectó un visor VR compatible en este dispositivo"}
                className="rounded-xl px-5 py-2.5 font-bold border transition disabled:opacity-40 disabled:cursor-not-allowed bg-sky-500/20 border-sky-300/40 hover:bg-sky-500/35"
              >
                🥽 {vr ? "Iniciar en realidad virtual" : "VR no disponible aquí (juega en pantalla)"}
              </button>
              <button
                onClick={() => setShowHelp((v) => !v)}
                className="rounded-xl px-5 py-2.5 font-bold border border-white/15 bg-white/5 hover:bg-white/15 transition"
              >
                ❔ ¿Cómo se juega?
              </button>
            </div>

            {showHelp && (
              <div className="mt-5">
                <ControlsHelp />
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-emerald-100/70">
              <div className="rounded-lg bg-white/5 p-2">🧭 Navegación libre en 3D</div>
              <div className="rounded-lg bg-white/5 p-2">📍 12 checkpoints con preguntas</div>
              <div className="rounded-lg bg-white/5 p-2">🏆 Puntaje, estrellas y examen final</div>
            </div>
          </div>
          <p className="text-center text-xs text-white/50 mt-4">
            Escala aproximada: 1 paso ≈ 1 micrómetro (µm). Una célula vegetal real mide entre 10 y 100 µm.
          </p>
        </div>
      </div>
    </div>
  );
}
