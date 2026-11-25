import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, type ReactNode } from 'react';
import {
  BoxGeometry, CanvasTexture, CylinderGeometry, MeshStandardMaterial, Quaternion, SphereGeometry,
  SRGBColorSpace, TorusGeometry, Vector3, type Group, type Object3D, type SpotLight,
} from 'three';
import type { Part } from '@/lib/content';
import { jawOffset, lowerLength, shoulder, solveArm, upperLength, type Point } from './kinematics';

const shell = new MeshStandardMaterial({ color: '#d5dfd5', roughness: .34, metalness: .25 });
const orange = new MeshStandardMaterial({ color: '#fe6a33', roughness: .4, metalness: .24 });
const metal = new MeshStandardMaterial({ color: '#41565b', roughness: .36, metalness: .66 });
const carbon = new MeshStandardMaterial({ color: '#12252d', roughness: .61, metalness: .32 });
const black = new MeshStandardMaterial({ color: '#071619', roughness: .38, metalness: .2 });
const teal = new MeshStandardMaterial({ color: '#247875', roughness: .32, metalness: .45 });
const glass = new MeshStandardMaterial({ color: '#0a2f40', emissive: '#074957', emissiveIntensity: .32, roughness: .11, metalness: .46 });
const reflect = new MeshStandardMaterial({ color: '#a2e6dd', roughness: .18, metalness: .36 });
const lit = new MeshStandardMaterial({ color: '#d8fff4', emissive: '#97ffe9', emissiveIntensity: 3.5, roughness: .16 });
const highlight = new MeshStandardMaterial({ color: '#92ffdc', emissive: '#20b79a', emissiveIntensity: .67, roughness: .32, metalness: .18 });
const unitBox = new BoxGeometry(1, 1, 1);
const unitBall = new SphereGeometry(1, 20, 12);
const unitCylinder = new CylinderGeometry(1, 1, 1, 24);
const ringCache = new Map<string, TorusGeometry>();
const up = new Vector3(0, 1, 0);

function Box({ at, size, material, rotation }: { at: Point; size: Point; material: MeshStandardMaterial; rotation?: Point }) {
  return <mesh position={at} scale={size} rotation={rotation} material={material}><primitive object={unitBox} attach="geometry" /></mesh>;
}

function Ball({ at, size, material }: { at: Point; size: Point; material: MeshStandardMaterial }) {
  return <mesh position={at} scale={size} material={material}><primitive object={unitBall} attach="geometry" /></mesh>;
}

function Cylinder({ at, radius, height, material, rotation }: { at: Point; radius: number; height: number; material: MeshStandardMaterial; rotation?: Point }) {
  return <mesh position={at} scale={[radius, height, radius]} rotation={rotation} material={material}><primitive object={unitCylinder} attach="geometry" /></mesh>;
}

function Ring({ at, radius, tube, material }: { at: Point; radius: number; tube: number; material: MeshStandardMaterial }) {
  const key = radius + ':' + tube;
  let geometry = ringCache.get(key);
  if (!geometry) {
    geometry = new TorusGeometry(radius, tube, 8, 36);
    ringCache.set(key, geometry);
  }
  return <mesh position={at} material={material}><primitive object={geometry} attach="geometry" /></mesh>;
}

function Rod({ from, to, radius, material }: { from: Point; to: Point; radius: number; material: MeshStandardMaterial }) {
  const direction = new Vector3(...to).sub(new Vector3(...from));
  const rotation = new Quaternion().setFromUnitVectors(up, direction.clone().normalize());
  const center = new Vector3(...from).addScaledVector(direction, .5);
  return <mesh position={center} quaternion={rotation} scale={[radius, direction.length(), radius]} material={material}><primitive object={unitCylinder} attach="geometry" /></mesh>;
}

const horizontal: Point = [Math.PI / 2, 0, 0];
const sideways: Point = [0, 0, Math.PI / 2];
const bolts = Array.from({ length: 10 }, (_, index) => index * Math.PI / 5);
function createLivery() {
  if (typeof document === 'undefined') return null;
  const source = document.createElement('canvas');
  source.width = 512;
  source.height = 176;
  const ctx = source.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#14333a';
  ctx.font = 'bold 73px Arial';
  ctx.fillText('PR–01', 21, 87);
  ctx.font = 'bold 28px monospace';
  ctx.fillText('PELAGIC ROBOTICS', 25, 131);
  ctx.fillStyle = '#ec602c';
  ctx.fillRect(25, 151, 150, 10);
  const texture = new CanvasTexture(source);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

const labelTexture = createLivery();

function Livery() {
  return <mesh position={[0, .721, -.14]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[1.03, .35]} />
    <meshStandardMaterial map={labelTexture} transparent depthWrite={false} roughness={.79} />
  </mesh>;
}

function Housing({ selected }: { selected: boolean }) {
  const finish = selected ? highlight : shell;
  return <>
    <Cylinder at={[0, .14, -.06]} radius={.465} height={1.55} material={finish} rotation={horizontal} />
    <Ball at={[0, .14, -.83]} size={[.46, .46, .17]} material={metal} />
    <Ball at={[0, .14, .7]} size={[.46, .46, .18]} material={finish} />
    {[.55, -.6].map(z => <group key={z}>
      <Cylinder at={[0, .14, z]} radius={.48} height={.088} material={metal} rotation={horizontal} />
      <Ring at={[0, .14, z + .05]} radius={.438} tube={.025} material={black} />
    </group>)}
    {bolts.map(angle => <Cylinder key={angle} at={[.356 * Math.cos(angle), .14 + .356 * Math.sin(angle), .8]} radius={.025} height={.052} material={metal} rotation={horizontal} />)}
    <RoundedBox args={[1.18, .21, 1.47]} position={[0, .615, -.12]} radius={.084} smoothness={3} material={finish} />
    <Livery />
    {[-1, 1].map(side => <group key={side} position={[side * .617, .55, -.1]}>
      <Box at={[0, 0, 0]} size={[.105, .11, .92]} material={metal} />
      {Array.from({ length: 7 }, (_, i) => <Box key={i} at={[side * .056, .005, -.33 + i * .11]} size={[.04, .082, .04]} material={black} />)}
    </group>)}
    <Cylinder at={[.19, .78, -.65]} radius={.08} height={.16} material={metal} />
    <Cylinder at={[.19, .9, -.65]} radius={.04} height={.16} material={teal} />
    <Ball at={[.19, .99, -.65]} size={[.044, .025, .044]} material={reflect} />
  </>;
}

function Frame({ selected }: { selected: boolean }) {
  const finish = selected ? highlight : orange;
  return <>
    {[-1, 1].map(side => {
      const x = side * 1.11;
      const hoop: Point[] = [[x, -.62, -1.14], [x, -.62, 1.12], [x, -.35, 1.24], [x, .49, .95], [x, .64, .65], [x, .64, -.7], [x, .45, -1.1], [x, -.62, -1.14]];
      return <group key={side}>
        {hoop.slice(1).map((point, index) => <Rod key={index} from={hoop[index]} to={point} radius={.061} material={finish} />)}
        {hoop.slice(0, -1).map((point, index) => <Ball key={index} at={point} size={[.061, .061, .061]} material={finish} />)}
        <Rod from={[x, -.52, -.96]} to={[x, .32, .64]} radius={.038} material={metal} />
        <RoundedBox args={[.23, .11, 2.46]} radius={.04} smoothness={2} position={[x, -.72, -.02]} material={carbon} />
        <RoundedBox args={[.29, .105, .68]} radius={.035} smoothness={2} position={[x, -.66, .68]} material={finish} />
        <RoundedBox args={[.29, .105, .59]} radius={.035} smoothness={2} position={[x, -.66, -.77]} material={finish} />
        <Box at={[x, .31, .69]} size={[.175, .19, .36]} material={carbon} rotation={[.14, 0, 0]} />
        <Box at={[side * 1.208, .31, .69]} size={[.027, .042, .24]} material={reflect} />
      </group>;
    })}
    {[-1.08, .97].map(z => <group key={z}>
      <Rod from={[-1.08, -.58, z]} to={[1.08, -.58, z]} radius={.045} material={metal} />
      <Rod from={[-1.04, .36, z]} to={[1.04, .36, z]} radius={.05} material={finish} />
    </group>)}
    <RoundedBox args={[1.33, .17, 1.11]} position={[0, -.45, -.15]} radius={.04} smoothness={3} material={carbon} />
    <Box at={[0, -.55, -.36]} size={[.69, .14, .68]} material={metal} />
  </>;
}

function Thruster({ speed, still, selected, radius = .31 }: { speed: number; still: boolean; selected: boolean; radius?: number }) {
  const rotor = useRef<Group>(null);
  useFrame((_, dt) => {
    if (!still && rotor.current) rotor.current.rotation.z += Math.min(dt, .04) * speed;
  });
  const casing = selected ? highlight : carbon;
  const rim = selected ? highlight : orange;
  return <>
    {[-.19, .19].map(z => <Ring key={z} at={[0, 0, z]} radius={radius} tube={.052} material={rim} />)}
    {Array.from({ length: 14 }, (_, index) => {
      const a = index * Math.PI / 7;
      return <Box key={index} at={[radius * Math.cos(a), radius * Math.sin(a), 0]} size={[.09, .15, .35]} rotation={[0, 0, a]} material={casing} />;
    })}
    <group ref={rotor} name="Propeller rotor">
      <Cylinder at={[0, 0, 0]} radius={radius * .36} height={.31} material={teal} rotation={horizontal} />
      {[0, 1, 2, 3].map(index => <group key={index} rotation={[0, 0, index * Math.PI / 2 + .3]}>
        <Box at={[radius * .6, .02, 0]} size={[radius * .61, radius * .29, .085]} rotation={[.33, -.2, -.27]} material={metal} />
      </group>)}
    </group>
    {[-.25, .25].map(z => <group key={z}>
      <Ring at={[0, 0, z]} radius={radius * .85} tube={.014} material={metal} />
      <Ring at={[0, 0, z]} radius={radius * .59} tube={.012} material={metal} />
      <Box at={[0, 0, z]} size={[radius * 1.83, .023, .024]} material={metal} />
      <Box at={[0, 0, z]} size={[.023, radius * 1.83, .024]} material={metal} />
    </group>)}
  </>;
}

function CameraPod({ turn, selected }: { turn: number; selected: boolean }) {
  return <group name="Camera yaw pivot" position={[0, -.045, 1.03]} rotation={[.06, turn, 0]}>
    <Cylinder at={[0, .168, -.02]} radius={.161} height={.19} material={metal} />
    <RoundedBox args={[.63, .34, .39]} radius={.09} smoothness={4} material={selected ? highlight : carbon} />
    <Cylinder at={[0, 0, .2]} radius={.157} height={.13} material={metal} rotation={horizontal} />
    <Ring at={[0, 0, .272]} radius={.137} tube={.024} material={teal} />
    <Ball at={[0, 0, .263]} size={[.117, .117, .046]} material={glass} />
    <Ball at={[-.035, .038, .301]} size={[.025, .02, .008]} material={reflect} />
    <Ball at={[.237, .063, .178]} size={[.028, .028, .02]} material={lit} />
  </group>;
}

function Lamps({ on, selected, beams }: { on: number; selected: boolean; beams: boolean }) {
  return <>{[-.79, .79].map(x => <group key={x} position={[x, .22, 1.015]} rotation={[.12, x * .09, 0]}>
    <Cylinder at={[0, 0, .01]} radius={.163} height={.32} material={selected ? highlight : metal} rotation={horizontal} />
    <Ring at={[0, 0, .183]} radius={.133} tube={.03} material={selected ? highlight : carbon} />
    <Cylinder at={[0, 0, .183]} radius={.116} height={.049} material={on > .05 ? lit : glass} rotation={horizontal} />
    {beams && on > .05 && <mesh position={[0, 0, 1.6]} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[.53, 2.8, 22, 1, true]} />
      <meshBasicMaterial color="#a3fff1" transparent opacity={on * .028} depthWrite={false} />
    </mesh>}
  </group>)}</>;
}

function Arm({ tip, grip, selected }: { tip: Point; grip: number; selected: boolean }) {
  const angles = solveArm(tip);
  const finish = selected ? highlight : orange;
  const wrist = lowerLength - jawOffset;
  return <group position={shoulder} name="Manipulator shoulder yaw" rotation={[0, angles.yaw, 0]}>
    <Cylinder at={[0, .05, 0]} radius={.171} height={.22} material={metal} />
    <group name="Manipulator shoulder pitch" rotation={[angles.pitch, 0, 0]}>
      <Cylinder at={[0, 0, 0]} radius={.144} height={.28} material={finish} rotation={sideways} />
      <RoundedBox args={[.19, .15, upperLength]} radius={.045} smoothness={2} position={[0, 0, upperLength / 2]} material={finish} />
      <Rod from={[.139, .04, .12]} to={[.139, .04, upperLength - .02]} radius={.034} material={metal} />
      <group rotation={[angles.elbow, 0, 0]} position={[0, 0, upperLength]} name="Manipulator elbow">
        <Cylinder at={[0, 0, 0]} radius={.114} height={.25} material={metal} rotation={sideways} />
        <RoundedBox args={[.139, .131, wrist]} radius={.04} smoothness={2} position={[0, 0, wrist / 2]} material={finish} />
        <Rod from={[.1, .043, .06]} to={[.09, .043, wrist - .035]} radius={.022} material={metal} />
        <group name="Gripper wrist" position={[0, 0, wrist]}>
          <Cylinder at={[0, 0, .01]} radius={.087} height={.18} material={metal} rotation={horizontal} />
          <Box at={[0, 0, .086]} size={[.255, .116, .14]} material={finish} />
          {[-1, 1].map(side => <group key={side} name={side < 0 ? 'Left gripper jaw' : 'Right gripper jaw'} position={[side * .106, 0, .13]} rotation={[0, side * (.48 - grip * .6), 0]}>
            <Box at={[0, 0, .075]} size={[.058, .115, .17]} material={metal} />
            <Box at={[-side * .018, 0, .155]} size={[.085, .115, .05]} material={finish} />
          </group>)}
        </group>
      </group>
    </group>
  </group>;
}

type VehicleProps = {
  lamp: number; turn: number; tip: Point; grip: number; exploded?: number;
  selected?: Part; speed?: number; still?: boolean; beams?: boolean;
  onSelect?: (part: Part) => void;
};

export function Vehicle({ lamp, turn, tip, grip, exploded = 0, selected, speed = 0, still = false, beams = false, onSelect }: VehicleProps) {
  const lampLight = useRef<SpotLight>(null);
  const beamTarget = useRef<Object3D>(null);
  useFrame(() => {
    if (lampLight.current && beamTarget.current) lampLight.current.target = beamTarget.current;
  });
  function assembly(part: Part, at: Point, children: ReactNode) {
    return <group name={part} position={at} onClick={onSelect ? event => { event.stopPropagation(); onSelect(part); } : undefined}>{children}</group>;
  }

  return <group name="PR-01 Manta">
    {assembly('housing', [0, .77 * exploded, -.3 * exploded], <Housing selected={selected === 'housing'} />)}
    {assembly('frame', [0, -.76 * exploded, -.24 * exploded], <Frame selected={selected === 'frame'} />)}
    {[-1, 1].map(side => <group key={side}>
      {assembly('thrusters', [side * (1.22 + exploded * .66), .24 + exploded * .18, -.49 - exploded * .15], <Thruster speed={speed * side} still={still} selected={selected === 'thrusters'} />)}
      {assembly('thrusters', [side * (.78 + exploded * .51), -.12 + exploded * .24, .2], <group rotation={[-Math.PI / 2, 0, 0]}><Thruster radius={.203} speed={speed * 1.18} still={still} selected={selected === 'thrusters'} /></group>)}
    </group>)}
    {assembly('camera', [0, .25 * exploded, .94 * exploded], <CameraPod turn={turn} selected={selected === 'camera'} />)}
    {assembly('lamps', [0, .58 * exploded, .43 * exploded], <Lamps on={lamp} selected={selected === 'lamps'} beams={beams} />)}
    {assembly('arm', [.68 * exploded, -.34 * exploded, .31 * exploded], <Arm tip={tip} grip={grip} selected={selected === 'arm'} />)}
    {beams && <>
      <object3D ref={beamTarget} position={[.05, -.95, 3.8]} />
      <spotLight ref={lampLight} position={[0, .27, 1.29]} intensity={lamp * 12} color="#b3fff0" angle={.6} distance={6} penumbra={.7} />
    </>}
  </group>;
}
