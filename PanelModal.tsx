import { selectBlocked, useGame } from "../store";
import { requestLock } from "../three/Player";
import { PanelModel, usePanelModel, starsFor } from "../usePanelModel";
import { MAX_SCORE } from "../data/organelles";
import { cn } from "../utils/cn";

const LETTERS = ["A", "B", "C", "D", "E"];

function relockIfNeeded() {
  const s = useGame.getState();
  if (!selectBlocked(s) && !s.isTouch && !s.xrActive) {
    const canvas = document.querySelector("canvas");
    if (canvas) requestLock(canvas);
  }
}

function Body({ model }: { model: PanelModel }) {
  return (
    <div className="space-y-3 text-slate-200 leading-relaxed">
      {model.body.map((p, i) => {
        const m = p.match(/^(Función|Dato curioso|Pista):\s*(.*)$/s);
        if (m) {
          const icon = m[1] === "Función" ? "⚙️" : m[1] === "Pista" ? "💡" : "✨";
          return (
            <p key={i} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
              <span className="font-bold text-lime-300">
                {icon} {m[1]}:
              </span>{" "}
              {m[2]}
            </p>
          );
        }
        return <p key={i}>{p}</p>;
      })}
    </div>
  );
}

export function PanelModal() {
  const model = usePanelModel();
  const score = useGame((s) => s.score);
  if (!model) return null;

  const toneBg: Record<string, string> = {
    info: "from-emerald-900/95 to-slate-950/95",
    question: "from-indigo-950/95 to-slate-950/95",
    success: "from-emerald-800/95 to-slate-950/95",
    error: "from-rose-950/95 to-slate-950/95",
    final: "from-amber-900/95 to-slate-950/95",
    results: "from-amber-800/95 via-emerald-900/95 to-slate-950/95",
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/55 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div
        key={model.key}
        className={cn(
          "w-full max-w-2xl rounded-3xl border border-white/15 shadow-2xl bg-gradient-to-br text-white animate-[pop_.25s_ease-out]",
          toneBg[model.tone]
        )}
        style={{ boxShadow: `0 0 0 3px ${model.accent}55, 0 30px 80px rgba(0,0,0,.5)` }}
      >
        <div className="p-5 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              {model.badge && (
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-black tracking-wide text-slate-900"
                  style={{ background: model.accent }}
                >
                  {model.badge}
                </span>
              )}
              {model.subtitle && model.tone !== "results" && (
                <div className="mt-2 text-sm text-white/70 font-semibold">{model.subtitle}</div>
              )}
              <h2 className="mt-1 text-2xl sm:text-3xl font-black leading-tight">
                {model.emoji && <span className="mr-2">{model.emoji}</span>}
                {model.title}
              </h2>
            </div>
            <div className="shrink-0 text-right text-xs text-white/60">
              Puntos
              <div className="text-xl font-black text-amber-300">{score}</div>
            </div>
          </div>

          {model.tone === "results" && (
            <div className="mt-4 flex flex-col items-center">
              <div className="text-5xl tracking-widest text-amber-300 drop-shadow">
                {"★".repeat(starsFor(score))}
                <span className="text-white/20">{"★".repeat(3 - starsFor(score))}</span>
              </div>
              <div className="text-lg font-bold mt-1">{model.subtitle}</div>
              <div className="mt-3 w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-lime-400 to-amber-300" style={{ width: `${(score / MAX_SCORE) * 100}%` }} />
              </div>
            </div>
          )}

          <div className="mt-4">
            <Body model={model} />
          </div>

          {model.options && (
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {model.options.map((o, i) => {
                const interactive = o.state === "idle" && model.tone === "question";
                return (
                  <button
                    key={i}
                    disabled={!interactive}
                    onClick={() => {
                      o.onClick();
                    }}
                    className={cn(
                      "text-left rounded-2xl border px-4 py-3 font-semibold transition flex gap-3 items-start",
                      o.state === "idle" && model.tone === "question" && "bg-white/10 border-white/15 hover:bg-lime-400/20 hover:border-lime-300/60 active:scale-[0.99]",
                      o.state === "idle" && model.tone !== "question" && "bg-white/5 border-white/10 opacity-70",
                      o.state === "disabled" && "bg-white/5 border-white/5 opacity-40 line-through",
                      o.state === "correct" && "bg-emerald-500/30 border-emerald-300/70 ring-2 ring-emerald-300/50",
                      o.state === "wrong" && "bg-rose-500/25 border-rose-300/60 opacity-80"
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 h-7 w-7 rounded-full grid place-items-center text-sm font-black",
                        o.state === "correct" ? "bg-emerald-300 text-emerald-950" : o.state === "wrong" ? "bg-rose-300 text-rose-950" : "bg-white/15"
                      )}
                    >
                      {o.state === "correct" ? "✓" : o.state === "wrong" ? "✗" : LETTERS[i]}
                    </span>
                    <span>{o.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {model.buttons.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              {model.buttons.map((b, i) => (
                <button
                  key={i}
                  onClick={() => {
                    b.onClick();
                    relockIfNeeded();
                  }}
                  className={cn(
                    "rounded-xl px-5 py-3 font-black transition active:scale-[0.98]",
                    b.variant === "primary"
                      ? "bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-500/30"
                      : "bg-white/10 hover:bg-white/20 border border-white/15"
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
