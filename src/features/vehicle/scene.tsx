'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { Color, Vector3, type DirectionalLight, type Group } from 'three';
import type { Part } from '@/lib/content';
import { Particles, Reef } from '@/features/dive/reef';
import { missionAt } from '@/features/dive/timeline';
import { blend, labTip, smooth, stowedTip, type Point } from './kinematics';
import { Vehicle } from './vehicle';

export const views = { quarter: [3.7, 2.05, 4.5], front: [0, .39, 5.7], side: [5.7, .52, .04], top: [0, 6.4, .08] } satisfies Record<string, Point>;
export type View = keyof typeof views;
export type LabState = { view: View; reset: number; selected?: Part; lamp: boolean; turn: number; deployed: boolean; exploded: boolean; orbitEnabled: boolean };

type SceneProps = {
  mode: 'hero' | 'dive' | 'lab';
  visible: boolean;
  paused: boolean;
  mobile: boolean;
  progress?: number;
  lab?: LabState;
  onSelect?: (part: Part) => void;
  onReady: () => void;
  onFailure: () => void;
};

const lightColor = new Color('#c9fff0');
const look = new Vector3();
const shot = new Vector3();

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Signals({ onReady, onFailure }: Pick<SceneProps, 'onReady' | 'onFailure'>) {
  const { gl } = useThree();
  const reported = useRef(false);
  useFrame(() => {
    if (reported.current) return;
    reported.current = true;
    requestAnimationFrame(onReady);
  });
  useEffect(() => {
    const canvas = gl.domElement;
    function failed(event: Event) {
      event.preventDefault();
      onFailure();
    }
    canvas.addEventListener('webglcontextlost', failed);
    return () => canvas.removeEventListener('webglcontextlost', failed);
  }, [gl, onFailure]);
  return null;
}

function Opening({ paused, mobile }: { paused: boolean; mobile: boolean }) {
  const time = useRef(paused ? 5 : 0);
  const rig = useRef<Group>(null);
  const specks = useRef<Group>(null);
  const light = useRef<DirectionalLight>(null);
  const lamps = useRef<Group>(null);
  useFrame(({ camera }, dt) => {
    if (!paused) time.current += Math.min(dt, .05);
    const elapsed = time.current;
    const settle = smooth(0, 3.9, elapsed);
    const power = smooth(.94, 2.55, elapsed);
    const lighting = smooth(2.05, 3.32, elapsed);
    if (rig.current) {
      rig.current.position.y = .1 + Math.sin(elapsed * .76) * .074;
      rig.current.rotation.set(.06 * (1 - settle), -.36 * (1 - settle) + Math.sin(elapsed * .48) * .046, -.075 * (1 - settle));
    }
    if (specks.current) specks.current.rotation.z = Math.sin(elapsed * .14) * .08;
    if (light.current) light.current.position.x = -4 + smooth(.2, 3.4, elapsed) * 6 + Math.sin(elapsed * .55) * 1.2;
    if (lamps.current) lamps.current.visible = lighting > .45;
    if (!paused) {
      rig.current?.traverse(object => {
        if (object.name === 'Propeller rotor') object.rotation.z += Math.min(dt, .04) * power * 24;
      });
    }
    camera.position.set(2.15 + 1.12 * settle, 1.42 + .47 * settle, mobile ? 5.6 : 4.65);
    camera.lookAt(.12, -.08, .02);
  });

  return <>
    <hemisphereLight color="#c8ffff" groundColor="#417178" intensity={1.62} />
    <directionalLight ref={light} position={[2, 6, 2.6]} intensity={3.05} color={lightColor} />
    <directionalLight position={[-4, 2, -4]} intensity={2.85} color="#69e9ed" />
    <directionalLight position={[1, -3, 3]} intensity={.57} color="#64b8c6" />
    <group ref={specks}><Particles spread={14} /></group>
    <group ref={rig}>
      <Vehicle lamp={0} turn={-.08} tip={stowedTip} grip={.78} still />
      <group ref={lamps} name="Opening lamp glow">
        {[-.79, .79].map(x => <group key={x} position={[x, .20, 1.209]}>
          <mesh><sphereGeometry args={[.114, 20, 12]} /><meshBasicMaterial color="#d7fff4" /></mesh>
          <pointLight color="#a7ffed" intensity={1.12} distance={1.8} position={[0, 0, .21]} />
        </group>)}
      </group>
    </group>
  </>;
}

function Mission({ progress, mobile, paused }: { progress: number; mobile: boolean; paused: boolean }) {
  const scene = missionAt(progress);
  const depth = scene.darkness;
  const close = smooth(2.72, 3.42, progress) * (1 - smooth(4.02, 4.65, progress));
  useFrame(({ camera }) => {
    look.set(.08 + .37 * close, scene.position[1] - .23 - .3 * close, .34 + .57 * close);
    shot.set(
      (mobile ? 3.28 : 3.78) - close * 1.38,
      1.49 + scene.position[1] + close * .27,
      (mobile ? 6.35 : 5.59) - close * (mobile ? .42 : .59),
    );
    camera.position.copy(shot);
    camera.lookAt(look);
  });
  return <>
    <fog attach="fog" args={[depth > .5 ? '#093746' : '#126373', 5.7 - depth * .9, 24 - depth * 9]} />
    <hemisphereLight color="#b9fffa" groundColor="#477775" intensity={1.47 - .62 * depth} />
    <directionalLight color="#cafff1" position={[1.5, 7, 2.5]} intensity={2.72 - 1.3 * depth} />
    <directionalLight color="#6dc0df" position={[-4, 2, -5]} intensity={1.48} />
    <pointLight color="#a0f6df" position={[1.28, -.67, 2.1]} distance={5} intensity={close * 5} />
    <Particles tone="#74c5c0" />
    <Reef scan={scene.survey} sweep={scene.scan} sample={scene.sample} twist={scene.sampleTwist} holding={scene.holding} />
    <group position={scene.position} rotation={[0, scene.yaw, 0]}>
      <Vehicle lamp={scene.lamp} beams turn={scene.turn} tip={scene.tip} grip={scene.grip} speed={scene.speed} still={paused} />
    </group>
  </>;
}

function LabScene({ lab, mobile, onSelect }: { lab: LabState; mobile: boolean; onSelect?: (part: Part) => void }) {
  const invalidate = useThree(state => state.invalidate);
  const arm = useRef(0);
  const separation = useRef(0);
  const [pose, setPose] = useState<[number, number]>([0, 0]);
  useFrame(({ camera }, dt) => {
    const desiredArm = Number(lab.deployed);
    const desiredExploded = Number(lab.exploded);
    if (arm.current === desiredArm && separation.current === desiredExploded) return;
    const step = Math.min(dt, .05) * 2.35;
    arm.current += Math.sign(desiredArm - arm.current) * Math.min(step, Math.abs(desiredArm - arm.current));
    separation.current += Math.sign(desiredExploded - separation.current) * Math.min(step, Math.abs(desiredExploded - separation.current));
    const deployed = smooth(0, 1, arm.current);
    const exploded = smooth(0, 1, separation.current);
    camera.zoom = 1 - deployed * .105 - exploded * .29;
    camera.updateProjectionMatrix();
    setPose([deployed, exploded]);
    invalidate();
  });
  return <>
    <hemisphereLight color="#e3fff7" groundColor="#55737d" intensity={1.68} />
    <directionalLight position={[.3, 6, 3]} intensity={2.7} color="#ddfff3" />
    <directionalLight position={[-4, 1.5, -4]} intensity={2.45} color="#6de1e4" />
    <group position={[0, pose[0] * .15 + pose[1] * .32, 0]}>
      <Vehicle lamp={Number(lab.lamp)} turn={lab.turn} tip={blend(stowedTip, labTip, pose[0])} grip={.76 - pose[0] * .63} exploded={pose[1]} selected={lab.selected} onSelect={onSelect} still />
    </group>
    <ViewCamera view={lab.view} reset={lab.reset} mobile={mobile} />
    <OrbitControls makeDefault enablePan={false} enableZoom={false} enabled={lab.orbitEnabled} enableDamping={false} />
  </>;
}

function ViewCamera({ view, reset, mobile }: { view: View; reset: number; mobile: boolean }) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    const point = views[view];
    camera.position.set(...point).multiplyScalar(mobile ? 1.22 : 1);
    camera.lookAt(0, 0, 0);
    invalidate();
  }, [camera, invalidate, mobile, reset, view]);
  return null;
}

export default function Scene(props: SceneProps) {
  const { mode, visible, paused, mobile, progress = 0, lab, onSelect, onReady, onFailure } = props;
  const continuous = mode !== 'lab' && visible && !paused;
  return <SceneBoundary onFailure={onFailure}>
    <Canvas
      aria-hidden="true"
      camera={{ position: [3.5, 1.7, 5.5], fov: mode === 'dive' ? 42 : 40, near: .1, far: 50 }}
      dpr={mobile ? [1, 1.2] : [1, 1.45]}
      frameloop={continuous ? 'always' : 'demand'}
      gl={{ alpha: true, antialias: !mobile, powerPreference: 'high-performance' }}
    >
      <Signals onReady={onReady} onFailure={onFailure} />
      {mode === 'hero' && <Opening paused={paused || !visible} mobile={mobile} />}
      {mode === 'dive' && <Mission progress={progress} mobile={mobile} paused={paused || !visible} />}
      {mode === 'lab' && lab && <LabScene lab={lab} mobile={mobile} onSelect={onSelect} />}
    </Canvas>
  </SceneBoundary>;
}
