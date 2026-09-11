import { create } from "zustand";
import {
  BY_ID,
  FINAL_QUIZ,
  ORDER,
  POINTS_FINAL,
  POINTS_FIRST_TRY,
  POINTS_LATER,
  POINTS_SECOND_TRY,
} from "./data/organelles";
import { sfx } from "./sfx";

export type Phase = "start" | "playing" | "final" | "results" | "free";

export type Panel =
  | { type: "info"; id: string; review: boolean }
  | { type: "question"; id: string; attempts: number; wrongChoices: number[] }
  | {
      type: "feedback";
      id: string;
      correct: boolean;
      choice: number;
      attempts: number;
      wrongChoices: number[];
      points: number;
    }
  | null;

export interface FinalState {
  started: boolean;
  index: number;
  choice: number | null;
  correctCount: number;
}

export interface CompletedInfo {
  points: number;
  attempts: number;
}

interface GameState {
  phase: Phase;
  playerName: string;
  muted: boolean;
  xrActive: boolean;
  locked: boolean;
  /** El navegador no permite pointer lock (p. ej. iframe): se usa "arrastrar para mirar" */
  lockUnavailable: boolean;
  isTouch: boolean;
  helpOpen: boolean;
  notebookOpen: boolean;
  currentIndex: number;
  completed: Record<string, CompletedInfo>;
  score: number;
  panel: Panel;
  final: FinalState;
  startedAt: number;
  finishedAt: number;
  player: { x: number; z: number; yaw: number };
  nearCompleted: string | null;

  start: (name: string) => void;
  openCheckpoint: (id: string) => void;
  openReview: (id: string) => void;
  proceedToQuestion: () => void;
  answer: (choice: number) => void;
  retry: () => void;
  completeCheckpoint: () => void;
  closePanel: () => void;
  startFinal: () => void;
  answerFinal: (choice: number) => void;
  nextFinal: () => void;
  enterFree: () => void;
  restart: () => void;
  setPlayer: (x: number, z: number, yaw: number) => void;
  setNearCompleted: (id: string | null) => void;
  setLocked: (v: boolean) => void;
  setLockUnavailable: (v: boolean) => void;
  setXrActive: (v: boolean) => void;
  toggleMute: () => void;
  setHelpOpen: (v: boolean) => void;
  setNotebookOpen: (v: boolean) => void;
}

const initialFinal: FinalState = {
  started: false,
  index: 0,
  choice: null,
  correctCount: 0,
};

const detectTouch = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
  !window.matchMedia("(pointer: fine)").matches;

export const useGame = create<GameState>()((set, get) => ({
  phase: "start",
  playerName: "",
  muted: false,
  xrActive: false,
  locked: false,
  lockUnavailable: false,
  isTouch: detectTouch(),
  helpOpen: false,
  notebookOpen: false,
  currentIndex: 0,
  completed: {},
  score: 0,
  panel: null,
  final: { ...initialFinal },
  startedAt: 0,
  finishedAt: 0,
  player: { x: 0, z: 22, yaw: 0 },
  nearCompleted: null,

  start: (name) => {
    sfx.click();
    set({
      phase: "playing",
      playerName: name.trim() || "Explorador/a",
      currentIndex: 0,
      completed: {},
      score: 0,
      panel: null,
      final: { ...initialFinal },
      startedAt: Date.now(),
      finishedAt: 0,
      helpOpen: false,
      notebookOpen: false,
      nearCompleted: null,
    });
  },

  openCheckpoint: (id) => {
    const s = get();
    if (s.panel) return;
    if (s.phase === "playing" && ORDER[s.currentIndex] === id) {
      sfx.checkpoint();
      set({ panel: { type: "info", id, review: false } });
    } else if (s.phase === "free") {
      sfx.checkpoint();
      set({ panel: { type: "info", id, review: true } });
    }
  },

  openReview: (id) => {
    const s = get();
    if (s.panel) return;
    if (!BY_ID[id]) return;
    sfx.click();
    set({ panel: { type: "info", id, review: true } });
  },

  proceedToQuestion: () => {
    const p = get().panel;
    if (!p || p.type !== "info" || p.review) return;
    sfx.click();
    set({ panel: { type: "question", id: p.id, attempts: 0, wrongChoices: [] } });
  },

  answer: (choice) => {
    const p = get().panel;
    if (!p || p.type !== "question") return;
    const org = BY_ID[p.id];
    const correct = org.question.answer === choice;
    if (correct) {
      const points =
        p.attempts === 0
          ? POINTS_FIRST_TRY
          : p.attempts === 1
          ? POINTS_SECOND_TRY
          : POINTS_LATER;
      sfx.correct();
      set({
        panel: {
          type: "feedback",
          id: p.id,
          correct: true,
          choice,
          attempts: p.attempts,
          wrongChoices: p.wrongChoices,
          points,
        },
      });
    } else {
      sfx.wrong();
      set({
        panel: {
          type: "feedback",
          id: p.id,
          correct: false,
          choice,
          attempts: p.attempts + 1,
          wrongChoices: [...p.wrongChoices, choice],
          points: 0,
        },
      });
    }
  },

  retry: () => {
    const p = get().panel;
    if (!p || p.type !== "feedback" || p.correct) return;
    sfx.click();
    set({
      panel: {
        type: "question",
        id: p.id,
        attempts: p.attempts,
        wrongChoices: p.wrongChoices,
      },
    });
  },

  completeCheckpoint: () => {
    const s = get();
    const p = s.panel;
    if (!p || p.type !== "feedback" || !p.correct) return;
    sfx.click();
    const completed = {
      ...s.completed,
      [p.id]: { points: p.points, attempts: p.attempts },
    };
    const nextIndex = s.currentIndex + 1;
    const score = s.score + p.points;
    if (nextIndex >= ORDER.length) {
      sfx.fanfare();
      set({
        completed,
        score,
        currentIndex: nextIndex,
        panel: null,
        phase: "final",
        final: { ...initialFinal },
      });
    } else {
      set({ completed, score, currentIndex: nextIndex, panel: null });
    }
  },

  closePanel: () => {
    sfx.click();
    set({ panel: null });
  },

  startFinal: () => {
    sfx.click();
    set((s) => ({ final: { ...s.final, started: true, index: 0, choice: null } }));
  },

  answerFinal: (choice) => {
    const s = get();
    if (s.final.choice !== null) return;
    const q = FINAL_QUIZ[s.final.index];
    const correct = q.answer === choice;
    if (correct) sfx.correct();
    else sfx.wrong();
    set({
      final: {
        ...s.final,
        choice,
        correctCount: s.final.correctCount + (correct ? 1 : 0),
      },
      score: s.score + (correct ? POINTS_FINAL : 0),
    });
  },

  nextFinal: () => {
    const s = get();
    sfx.click();
    if (s.final.index + 1 < FINAL_QUIZ.length) {
      set({ final: { ...s.final, index: s.final.index + 1, choice: null } });
    } else {
      sfx.fanfare();
      set({ phase: "results", finishedAt: Date.now() });
    }
  },

  enterFree: () => {
    sfx.click();
    set({ phase: "free", panel: null });
  },

  restart: () => {
    sfx.click();
    set({
      phase: "start",
      currentIndex: 0,
      completed: {},
      score: 0,
      panel: null,
      final: { ...initialFinal },
      nearCompleted: null,
    });
  },

  setPlayer: (x, z, yaw) => set({ player: { x, z, yaw } }),
  setNearCompleted: (id) => {
    if (get().nearCompleted !== id) set({ nearCompleted: id });
  },
  setLocked: (v) => set({ locked: v }),
  setLockUnavailable: (v) => {
    if (get().lockUnavailable !== v) set({ lockUnavailable: v });
  },
  setXrActive: (v) => set({ xrActive: v }),
  toggleMute: () =>
    set((s) => {
      sfx.setMuted(!s.muted);
      return { muted: !s.muted };
    }),
  setHelpOpen: (v) => set({ helpOpen: v }),
  setNotebookOpen: (v) => set({ notebookOpen: v }),
}));

/** ¿Hay alguna interfaz modal abierta que deba bloquear el movimiento? */
export const selectBlocked = (s: GameState) =>
  s.panel !== null ||
  s.phase === "final" ||
  s.phase === "results" ||
  s.phase === "start" ||
  s.helpOpen ||
  s.notebookOpen;
