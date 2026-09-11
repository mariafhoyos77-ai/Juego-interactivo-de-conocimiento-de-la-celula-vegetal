import { createXRStore } from "@react-three/xr";

/** Store de WebXR compartido entre la UI (botón "Entrar en VR") y el Canvas. */
export const xrStore = createXRStore({
  // Los mandos se dibujan por defecto con punteros de rayo para pulsar los botones 3D
  hand: { teleportPointer: false },
  controller: { teleportPointer: false },
  foveation: 0,
  emulate: false,
});

export async function checkVRSupport(): Promise<boolean> {
  try {
    const xr = (navigator as Navigator & { xr?: XRSystem }).xr;
    if (!xr) return false;
    return await xr.isSessionSupported("immersive-vr");
  } catch {
    return false;
  }
}
