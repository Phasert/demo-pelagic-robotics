import { blend, mix, smooth, solveArm, stowedTip, toLocal, toWorld, type Point } from '@/features/vehicle/kinematics';

export const missionEnd = 5;
export const rockOrigin: Point = [1.06, -1.59, 1.86];
export const stageStops = [.24, 1.47, 2.51, 3.69, 4.98] as const;

const vehicleKeys: Point[] = [
  [-.42, 6.4, -.2], [-.22, 5.37, -.1], [.03, -.29, .21], [0, -.36, .2], [0, -.36, .2], [-.56, 5.95, -.75],
];
const yawKeys = [-.28, -.12, .12, .09, .09, -.29];
const depths = [0, 4, 23, 28, 28, 0];

export function missionAt(progress: number) {
  const p = Math.max(0, Math.min(missionEnd, progress));
  const segment = Math.min(4, Math.floor(p));
  const t = smooth(0, 1, p - segment);
  const position = blend(vehicleKeys[segment], vehicleKeys[segment + 1], t);
  const yaw = mix(yawKeys[segment], yawKeys[segment + 1], t);
  const approach = smooth(3.03, 3.37, p);
  const retract = smooth(3.52, 3.94, p);
  const carriedTip: Point = [1.14, -.92, 1.68];
  const touch = toLocal(rockOrigin, position, yaw);
  const tip = blend(blend(stowedTip, touch, approach), carriedTip, retract);
  const holding = p >= 3.43;
  const closing = smooth(3.32, 3.43, p);
  const sample = holding ? toWorld(solveArm(tip).grip, position, yaw) : rockOrigin;
  return {
    p, segment, position, yaw, tip, sample, holding, grip: closing,
    sampleTwist: holding ? smooth(3.46, 3.95, p) * .48 : 0,
    depth: Math.round(mix(depths[segment], depths[segment + 1], t)),
    darkness: smooth(.6, 2.6, p) * (1 - smooth(4.26, 5, p) * .79),
    lamp: smooth(.12, .72, p),
    speed: 24 * smooth(0, .48, p) * (1 - .65 * smooth(2.1, 3.15, p) + .55 * smooth(4.05, 4.65, p)),
    survey: smooth(1.96, 2.14, p) * (1 - smooth(2.81, 3.04, p)),
    scan: smooth(2.05, 2.9, p),
    turn: -.68 * smooth(2.08, 2.44, p) + 1.15 * smooth(2.43, 2.85, p) - .47 * smooth(3, 3.38, p),
  };
}
