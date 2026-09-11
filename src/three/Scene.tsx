import { Canvas } from "@react-three/fiber";
import { XR } from "@react-three/xr";
import { Suspense } from "react";
import * as THREE from "three";
import { xrStore } from "../xrStore";
import {
  CellShell,
  Cytoplasm,
  Cytoskeleton,
  Lights,
  MembraneExhibit,
  Plasmodesmata,
  WallExhibit,
} from "./Cell";
import { Checkpoints } from "./Checkpoints";
import { Organelles } from "./Organelles";
import { Player } from "./Player";
import { VRPanel } from "./VRPanel";

export function Scene() {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ fov: 72, near: 0.08, far: 220, position: [0, 1.6, 22] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <XR store={xrStore}>
        <color attach="background" args={["#cfe6a8"]} />
        <fog attach="fog" args={["#d3e8b3", 28, 82]} />
        <Suspense fallback={null}>
          <Lights />
          <CellShell />
          <Cytoplasm />
          <Cytoskeleton />
          <Plasmodesmata />
          <WallExhibit />
          <MembraneExhibit />
          <Organelles />
          <Checkpoints />
          <Player />
          <VRPanel />
        </Suspense>
      </XR>
    </Canvas>
  );
}
