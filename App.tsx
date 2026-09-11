import { useEffect } from "react";
import { selectBlocked, useGame } from "./store";
import { Scene } from "./three/Scene";
import { HUD } from "./ui/HUD";
import { PanelModal } from "./ui/PanelModal";
import { StartScreen } from "./ui/StartScreen";

export default function App() {
  const phase = useGame((s) => s.phase);

  // Liberar el ratón cuando se abre cualquier panel / modal
  useEffect(() => {
    return useGame.subscribe((s, prev) => {
      const nowBlocked = selectBlocked(s);
      const wasBlocked = selectBlocked(prev);
      if (nowBlocked && !wasBlocked && document.pointerLockElement) {
        document.exitPointerLock();
      }
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-emerald-950 select-none overflow-hidden font-sans">
      <Scene />
      {phase === "start" ? (
        <StartScreen />
      ) : (
        <>
          <HUD />
          <PanelModal />
        </>
      )}
    </div>
  );
}
