import { describe, expect, test } from 'bun:test';
import { missionAt, rockOrigin, stageStops } from '../src/features/dive/timeline';
import { solveArm, toWorld } from '../src/features/vehicle/kinematics';

const distance = (a, b) => Math.hypot(...a.map((value, index) => value - b[index]));

describe('Expedition', () => {
  test('each stage stop lands in the corresponding chapter', () => {
    expect(stageStops.map(stop => missionAt(stop).segment)).toEqual([0, 1, 2, 3, 4]);
    expect(missionAt(-1)).toEqual(missionAt(0));
    expect(missionAt(6)).toEqual(missionAt(5));
  });

  test('contact transfers the sample to the gripper at the same position', () => {
    const immediatelyBefore = missionAt(3.42999);
    const contact = missionAt(3.43);
    expect(immediatelyBefore.holding).toBe(false);
    expect(contact.holding).toBe(true);
    expect(distance(contact.sample, rockOrigin)).toBeLessThan(1e-8);
    expect(contact.grip).toBe(1);
  });

  test('the recovery path keeps the sample in the gripper and reverses without history', () => {
    const forward = [3.3, 3.43, 3.53, 3.78, 4.2, 4.98].map(missionAt);
    expect(distance(forward[3].sample, rockOrigin)).toBeGreaterThan(.22);
    expect(forward[5].sample[1]).toBeGreaterThan(forward[3].sample[1]);
    for (const frame of forward.slice(1)) {
      expect(distance(frame.sample, toWorld(solveArm(frame.tip).grip, frame.position, frame.yaw))).toBeLessThan(1e-8);
    }
    expect([...forward].reverse().map(frame => missionAt(frame.p))).toEqual([...forward].reverse());
    expect(missionAt(3.29).sample).toEqual(rockOrigin);
    expect(missionAt(3.29).grip).toBe(0);
  });
});
