/** Estado de entrada compartido entre la interfaz DOM y el bucle 3D (sin re-renders). */
export const input = {
  keys: new Set<string>(),
  /** Joystick táctil: x (-1..1) derecha, y (-1..1) hacia atrás (positivo) */
  joy: { x: 0, y: 0 },
  /** Delta de mirada acumulado (px) desde el último frame */
  look: { dx: 0, dy: 0 },
  /** Posición del jugador en el suelo (fuente de verdad para escritorio y VR) */
  pos: { x: 0, z: 22 },
  yaw: 0,
  pitch: 0,
};

export function resetInput(x: number, z: number) {
  input.keys.clear();
  input.joy.x = 0;
  input.joy.y = 0;
  input.look.dx = 0;
  input.look.dy = 0;
  input.pos.x = x;
  input.pos.z = z;
  input.yaw = 0;
  input.pitch = 0;
}
