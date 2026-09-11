import { useFrame, useThree } from "@react-three/fiber";
import { XROrigin, useXR, useXRControllerLocomotion } from "@react-three/xr";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { COLLIDERS } from "../data/organelles";
import { input } from "../input";
import { selectBlocked, useGame } from "../store";

const PLAYER_RADIUS = 0.55;
const EYE_HEIGHT = 1.6;

/** Resuelve colisiones con orgánulos y con los límites de la célula */
export function resolvePosition(x: number, z: number): [number, number] {
  for (const [cx, cz, r] of COLLIDERS) {
    const dx = x - cx;
    const dz = z - cz;
    const d = Math.sqrt(dx * dx + dz * dz);
    const min = r + PLAYER_RADIUS;
    if (d < min) {
      if (d < 1e-4) {
        x = cx + min;
      } else {
        x = cx + (dx / d) * min;
        z = cz + (dz / d) * min;
      }
    }
  }
  const lim = 27;
  x = Math.max(-lim, Math.min(lim, x));
  z = Math.max(-lim, Math.min(lim, z));
  const c = 19;
  if (Math.abs(x) > c && Math.abs(z) > c) {
    const cx = Math.sign(x) * c;
    const cz = Math.sign(z) * c;
    const dx = x - cx;
    const dz = z - cz;
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d > lim - c) {
      x = cx + (dx / d) * (lim - c);
      z = cz + (dz / d) * (lim - c);
    }
  }
  return [x, z];
}

let everLocked = false;

function markLockUnavailable() {
  if (!everLocked) useGame.getState().setLockUnavailable(true);
}

export function requestLock(el: HTMLElement) {
  try {
    if (typeof el.requestPointerLock !== "function") {
      markLockUnavailable();
      return;
    }
    const p = (el.requestPointerLock as (() => Promise<void> | void) | undefined)?.call(el);
    if (p && typeof (p as Promise<void>).catch === "function") {
      (p as Promise<void>).catch(() => markLockUnavailable());
    }
  } catch {
    markLockUnavailable();
  }
}

export function Player() {
  const origin = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  const session = useXR((s) => s.session);
  const inXR = session != null;
  const vel = useMemo(() => new THREE.Vector2(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const bob = useRef(0);
  const lastSync = useRef(0);

  // sincronizar estado XR con el store
  useEffect(() => {
    useGame.getState().setXrActive(inXR);
    if (!inXR) {
      camera.rotation.order = "YXZ";
    }
  }, [inXR, camera]);

  // gancho de depuración/docencia: window.__celulab.teleport(x, z)
  useEffect(() => {
    const api = {
      teleport: (x: number, z: number) => {
        const [nx, nz] = resolvePosition(x, z);
        input.pos.x = nx;
        input.pos.z = nz;
      },
      store: useGame,
    };
    (window as unknown as { __celulab?: typeof api }).__celulab = api;
    return () => {
      delete (window as unknown as { __celulab?: typeof api }).__celulab;
    };
  }, []);

  // listeners de teclado, ratón, pointer lock y táctil
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.touchAction = "none";

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      input.keys.add(e.code);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
      if (e.code === "KeyE") {
        const s = useGame.getState();
        if (!selectBlocked(s) && s.nearCompleted) s.openReview(s.nearCompleted);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => input.keys.delete(e.code);
    const onBlur = () => input.keys.clear();
    // arrastre con el ratón (alternativa cuando no hay pointer lock)
    let dragging = false;
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && document.pointerLockElement !== canvas) dragging = true;
    };
    const onMouseUp = () => {
      dragging = false;
    };
    let ignoreUntil = 0;
    const onMouseMove = (e: MouseEvent) => {
      if (performance.now() < ignoreUntil) return;
      if (document.pointerLockElement === canvas || dragging) {
        // descartar saltos anómalos (primer evento tras el bloqueo)
        if (Math.abs(e.movementX) > 300 || Math.abs(e.movementY) > 300) return;
        input.look.dx += e.movementX;
        input.look.dy += e.movementY;
      }
    };
    const onLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      if (locked) {
        everLocked = true;
        ignoreUntil = performance.now() + 150;
        useGame.getState().setLockUnavailable(false);
      }
      useGame.getState().setLocked(locked);
    };
    const onLockError = () => markLockUnavailable();
    const onClick = () => {
      const s = useGame.getState();
      if (s.isTouch || s.xrActive || selectBlocked(s)) return;
      requestLock(canvas);
    };

    // táctil: arrastrar en la zona derecha para mirar
    let lookId: number | null = null;
    let lx = 0,
      ly = 0;
    const onTouchStart = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (lookId === null && t.clientX > window.innerWidth * 0.38) {
          lookId = t.identifier;
          lx = t.clientX;
          ly = t.clientY;
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === lookId) {
          input.look.dx += (t.clientX - lx) * 2.2;
          input.look.dy += (t.clientY - ly) * 2.2;
          lx = t.clientX;
          ly = t.clientY;
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) if (t.identifier === lookId) lookId = null;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("pointerlockerror", onLockError);
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("pointerlockerror", onLockError);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [gl]);

  // Locomoción VR con los mandos (joystick izquierdo mueve, derecho gira)
  useXRControllerLocomotion(
    (velocity, rotY, dt) => {
      const s = useGame.getState();
      if (selectBlocked(s)) return;
      const [x, z] = resolvePosition(input.pos.x + velocity.x * dt, input.pos.z + velocity.z * dt);
      input.pos.x = x;
      input.pos.z = z;
      input.yaw += rotY;
    },
    { speed: 3 },
    { type: "snap", degrees: 45 }
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = useGame.getState();
    const blocked = selectBlocked(s);
    const t = state.clock.getElapsedTime();

    if (!inXR) {
      // mirar
      const sens = 0.0021;
      if (!blocked) {
        input.yaw -= input.look.dx * sens;
        input.pitch -= input.look.dy * sens;
        input.pitch = Math.max(-1.45, Math.min(1.45, input.pitch));
      }
      input.look.dx = 0;
      input.look.dy = 0;
      if (s.phase === "start") {
        input.yaw = Math.sin(t * 0.12) * 0.18;
        input.pitch = 0.05;
      }

      // mover
      let mx = 0,
        mz = 0;
      if (!blocked) {
        const k = input.keys;
        if (k.has("KeyW") || k.has("ArrowUp")) mz -= 1;
        if (k.has("KeyS") || k.has("ArrowDown")) mz += 1;
        if (k.has("KeyA") || k.has("ArrowLeft")) mx -= 1;
        if (k.has("KeyD") || k.has("ArrowRight")) mx += 1;
        mx += input.joy.x;
        mz += input.joy.y;
        const len = Math.hypot(mx, mz);
        if (len > 1) {
          mx /= len;
          mz /= len;
        }
      }
      const run = input.keys.has("ShiftLeft") || input.keys.has("ShiftRight");
      const speed = run ? 9 : 5.5;
      const yaw = input.yaw;
      const tx = (Math.sin(yaw) * mz + Math.cos(yaw) * mx) * speed;
      const tz = (Math.cos(yaw) * mz - Math.sin(yaw) * mx) * speed;
      const k = Math.min(1, dt * 9);
      vel.x += (tx - vel.x) * k;
      vel.y += (tz - vel.y) * k;
      const [nx, nz] = resolvePosition(input.pos.x + vel.x * dt, input.pos.z + vel.y * dt);
      input.pos.x = nx;
      input.pos.z = nz;

      const moving = Math.hypot(vel.x, vel.y) > 0.4;
      if (moving) bob.current += dt * (run ? 13 : 9);
      const bobY = moving ? Math.sin(bob.current) * 0.035 : 0;

      camera.position.set(nx, EYE_HEIGHT + bobY, nz);
      camera.rotation.set(input.pitch, input.yaw, 0, "YXZ");
    }

    // el origen XR sigue siempre la posición del jugador
    if (origin.current) {
      origin.current.position.set(input.pos.x, 0, input.pos.z);
      origin.current.rotation.y = input.yaw;
    }

    // sincronizar con la interfaz (10 veces/s)
    if (t - lastSync.current > 0.1) {
      lastSync.current = t;
      if (inXR) {
        camera.getWorldPosition(tmp);
        const dir = camera.getWorldDirection(new THREE.Vector3());
        s.setPlayer(tmp.x, tmp.z, Math.atan2(-dir.x, -dir.z));
      } else {
        s.setPlayer(input.pos.x, input.pos.z, input.yaw);
      }
    }
  });

  return <XROrigin ref={origin} position={[input.pos.x, 0, input.pos.z]} />;
}
