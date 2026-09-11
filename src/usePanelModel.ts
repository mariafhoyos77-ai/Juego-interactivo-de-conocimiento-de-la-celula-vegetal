import { useMemo } from "react";
import { BY_ID, FINAL_QUIZ, MAX_SCORE, ORGANELLES } from "./data/organelles";
import { useGame } from "./store";

export type PanelTone = "info" | "question" | "success" | "error" | "final" | "results";

export interface PanelOption {
  label: string;
  state: "idle" | "disabled" | "correct" | "wrong";
  onClick: () => void;
}

export interface PanelButton {
  label: string;
  onClick: () => void;
  variant: "primary" | "secondary";
}

export interface PanelModel {
  key: string;
  tone: PanelTone;
  accent: string;
  badge?: string;
  title: string;
  subtitle?: string;
  emoji?: string;
  body: string[];
  options?: PanelOption[];
  buttons: PanelButton[];
  points?: number;
}

export function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function starsFor(score: number) {
  const pct = score / MAX_SCORE;
  return pct >= 0.85 ? 3 : pct >= 0.6 ? 2 : 1;
}

export function usePanelModel(): PanelModel | null {
  const phase = useGame((s) => s.phase);
  const panel = useGame((s) => s.panel);
  const final = useGame((s) => s.final);
  const score = useGame((s) => s.score);
  const completed = useGame((s) => s.completed);
  const startedAt = useGame((s) => s.startedAt);
  const finishedAt = useGame((s) => s.finishedAt);
  const playerName = useGame((s) => s.playerName);

  return useMemo<PanelModel | null>(() => {
    const g = useGame.getState();

    if ((phase === "playing" || phase === "free") && panel) {
      const org = BY_ID[panel.id];
      if (panel.type === "info") {
        return {
          key: `info-${org.id}-${panel.review}`,
          tone: "info",
          accent: org.color,
          emoji: org.emoji,
          badge: panel.review ? "Repaso" : `Checkpoint ${org.order} de ${ORGANELLES.length}`,
          title: org.name,
          body: [org.description, `Función: ${org.func}`, `Dato curioso: ${org.fact}`],
          buttons: panel.review
            ? [{ label: "Cerrar y seguir explorando", onClick: g.closePanel, variant: "primary" }]
            : [{ label: "¡Entendido! Responder la pregunta", onClick: g.proceedToQuestion, variant: "primary" }],
        };
      }
      if (panel.type === "question") {
        return {
          key: `q-${org.id}-${panel.attempts}`,
          tone: "question",
          accent: org.color,
          emoji: "❓",
          badge: `Pregunta · Checkpoint ${org.order}`,
          title: org.question.text,
          subtitle: org.name,
          body: panel.attempts > 0 ? [`Pista: ${org.question.hint}`] : [],
          options: org.question.options.map((label, i) => ({
            label,
            state: panel.wrongChoices.includes(i) ? "disabled" : "idle",
            onClick: () => g.answer(i),
          })),
          buttons: [],
        };
      }
      if (panel.type === "feedback") {
        if (panel.correct) {
          return {
            key: `fb-ok-${org.id}`,
            tone: "success",
            accent: "#66bb6a",
            emoji: "🎉",
            badge: `+${panel.points} puntos`,
            title: "¡Correcto!",
            subtitle: org.name,
            body: [org.question.explanation],
            points: panel.points,
            options: org.question.options.map((label, i) => ({
              label,
              state: i === org.question.answer ? "correct" : panel.wrongChoices.includes(i) ? "wrong" : "disabled",
              onClick: () => {},
            })),
            buttons: [
              {
                label: org.order === ORGANELLES.length ? "Ir al examen final" : "Continuar la exploración",
                onClick: g.completeCheckpoint,
                variant: "primary",
              },
            ],
          };
        }
        return {
          key: `fb-no-${org.id}-${panel.attempts}`,
          tone: "error",
          accent: "#ef5350",
          emoji: "🤔",
          badge: "Intenta de nuevo",
          title: "Esa no es la respuesta correcta",
          subtitle: org.name,
          body: [`Pista: ${org.question.hint}`, "Vuelve a leer la información y elige otra opción. Aún puedes ganar puntos."],
          options: org.question.options.map((label, i) => ({
            label,
            state: panel.wrongChoices.includes(i) ? "wrong" : "idle",
            onClick: () => {},
          })),
          buttons: [{ label: "Intentar de nuevo", onClick: g.retry, variant: "primary" }],
        };
      }
    }

    if (phase === "final") {
      if (!final.started) {
        return {
          key: "final-intro",
          tone: "final",
          accent: "#ffd54f",
          emoji: "🏁",
          badge: "Todos los checkpoints completados",
          title: "¡Examen final!",
          body: [
            `Excelente, ${playerName}. Has recorrido las ${ORGANELLES.length} partes de la célula vegetal.`,
            `Ahora responde ${FINAL_QUIZ.length} preguntas que combinan todo lo aprendido. Cada acierto vale 100 puntos y solo tienes un intento por pregunta.`,
          ],
          buttons: [{ label: "Comenzar el examen", onClick: g.startFinal, variant: "primary" }],
        };
      }
      const q = FINAL_QUIZ[final.index];
      if (final.choice === null) {
        return {
          key: `final-q-${final.index}`,
          tone: "question",
          accent: "#ffd54f",
          emoji: "📝",
          badge: `Examen final · Pregunta ${final.index + 1} de ${FINAL_QUIZ.length}`,
          title: q.text,
          body: [],
          options: q.options.map((label, i) => ({ label, state: "idle", onClick: () => g.answerFinal(i) })),
          buttons: [],
        };
      }
      const correct = final.choice === q.answer;
      return {
        key: `final-fb-${final.index}`,
        tone: correct ? "success" : "error",
        accent: correct ? "#66bb6a" : "#ef5350",
        emoji: correct ? "✅" : "❌",
        badge: correct ? "+100 puntos" : "Sin puntos",
        title: correct ? "¡Correcto!" : "Incorrecto",
        subtitle: q.text,
        body: [q.explanation],
        options: q.options.map((label, i) => ({
          label,
          state: i === q.answer ? "correct" : i === final.choice ? "wrong" : "disabled",
          onClick: () => {},
        })),
        buttons: [
          {
            label: final.index + 1 < FINAL_QUIZ.length ? "Siguiente pregunta" : "Ver mis resultados",
            onClick: g.nextFinal,
            variant: "primary",
          },
        ],
      };
    }

    if (phase === "results") {
      const stars = starsFor(score);
      const firstTry = Object.values(completed).filter((c) => c.attempts === 0).length;
      return {
        key: "results",
        tone: "results",
        accent: "#ffd54f",
        emoji: "🏆",
        badge: "★".repeat(stars) + "☆".repeat(3 - stars),
        title: "¡Expedición completada!",
        subtitle: playerName,
        body: [
          `Puntaje: ${score} de ${MAX_SCORE} puntos.`,
          `Checkpoints acertados al primer intento: ${firstTry} de ${ORGANELLES.length}.`,
          `Examen final: ${final.correctCount} de ${FINAL_QUIZ.length} correctas.`,
          `Tiempo total: ${formatTime(finishedAt - startedAt)}.`,
          stars === 3
            ? "¡Nivel experto en biología celular! Dominas la célula vegetal."
            : stars === 2
            ? "¡Muy bien! Repasa los orgánulos donde fallaste para alcanzar las 3 estrellas."
            : "Buen comienzo. Explora libremente y vuelve a intentarlo para mejorar tu puntaje.",
        ],
        buttons: [
          { label: "Explorar libremente la célula", onClick: g.enterFree, variant: "primary" },
          { label: "Jugar de nuevo", onClick: g.restart, variant: "secondary" },
        ],
      };
    }
    return null;
  }, [phase, panel, final, score, completed, startedAt, finishedAt, playerName]);
}
