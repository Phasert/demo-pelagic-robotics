export type Point = [number, number, number];

export const shoulder: Point = [.72, -.41, .73];
export const upperLength = .76;
export const lowerLength = .96;
export const jawOffset = .24;
export const stowedTip: Point = [.93, -.79, 1.14];
export const labTip: Point = [1.12, -1.03, 2.08];

export function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function blend(a: Point, b: Point, t: number): Point {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

export function smooth(start: number, end: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export function toWorld(local: Point, position: Point, yaw: number): Point {
  const [x, y, z] = local;
  return [position[0] + x * Math.cos(yaw) + z * Math.sin(yaw), position[1] + y, position[2] - x * Math.sin(yaw) + z * Math.cos(yaw)];
}

export function toLocal(world: Point, position: Point, yaw: number): Point {
  return toWorld([world[0] - position[0], world[1] - position[1], world[2] - position[2]], [0, 0, 0], -yaw);
}

export function solveArm(tip: Point) {
  const x = tip[0] - shoulder[0];
  const y = tip[1] - shoulder[1];
  const z = tip[2] - shoulder[2];
  const run = Math.hypot(x, z);
  const distance = Math.min(upperLength + lowerLength - .001, Math.max(Math.abs(upperLength - lowerLength) + .001, Math.hypot(run, y)));
  const cosine = (distance * distance - upperLength * upperLength - lowerLength * lowerLength) / (2 * upperLength * lowerLength);
  const elbow = Math.acos(Math.max(-1, Math.min(1, cosine)));
  const pitch = Math.atan2(-y, run) - Math.atan2(lowerLength * Math.sin(elbow), upperLength + lowerLength * Math.cos(elbow));
  const yaw = Math.atan2(x, z);
  const reach = upperLength * Math.cos(pitch) + lowerLength * Math.cos(pitch + elbow);
  const grip: Point = [
    shoulder[0] + reach * Math.sin(yaw),
    shoulder[1] - upperLength * Math.sin(pitch) - lowerLength * Math.sin(pitch + elbow),
    shoulder[2] + reach * Math.cos(yaw),
  ];
  return { yaw, pitch, elbow, grip };
}
