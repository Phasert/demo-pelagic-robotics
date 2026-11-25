import { Instances, Instance } from '@react-three/drei';
import { useMemo } from 'react';
import { BufferAttribute, PlaneGeometry, type WebGLProgramParametersWithUniforms } from 'three';
import type { Point } from '@/features/vehicle/kinematics';

function seed(value: number) {
  const n = Math.sin(value * 172.137 + 1.73) * 15731.714;
  return n - Math.floor(n);
}

export function Particles({ tone = '#badfdf', spread = 13 }: { tone?: string; spread?: number }) {
  const positions = useMemo(() => {
    const coords: number[] = [];
    for (let i = 0; i < 225; i++) {
      coords.push((seed(i * 3) - .5) * spread, (seed(i * 3 + 1) - .5) * 9, (seed(i * 3 + 2) - .5) * spread);
    }
    return new Float32Array(coords);
  }, [spread]);
  return <points renderOrder={1}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial color={tone} size={.018} transparent opacity={.58} depthWrite={false} />
  </points>;
}

const colors = ['#436d67', '#42766d', '#46636c', '#3e645f', '#547e66', '#5b7d70', '#367372'];
const coralColors = ['#bd8361', '#7b6967', '#856a75', '#ca9579', '#7a967e', '#5f9785'];
const stones = Array.from({ length: 140 }, (_, i) => {
  const index = i * 13;
  const x = (seed(index) - .5) * 24;
  const z = (seed(index + 1) - .5) * 25;
  const size = .1 + seed(index + 2) ** 2 * (Math.abs(x) > 2.5 ? 1.9 : .48);
  const at: Point = [x, -1.67, z];
  const scale: Point = [size * 1.6, size * (.38 + seed(index + 3) * .38), size * 1.18];
  return { at, scale, rotation: seed(index + 7) * 6.28, color: colors[i % colors.length] };
});

const coral = Array.from({ length: 63 }, (_, index) => {
  const i = 6000 + index * 13;
  const side = index % 3 === 0 ? -1 : 1;
  const x = side * (2.25 + seed(i) * 7.6);
  const z = -10 + seed(i + 1) * 16;
  const height = .21 + seed(i + 4) ** 2 * .93;
  return { x, z, height, color: coralColors[index % coralColors.length] };
});

function shadeSand(shader: WebGLProgramParametersWithUniforms) {
  shader.vertexShader = 'varying vec2 vReefPosition;\n' + shader.vertexShader
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvReefPosition = position.xz;');
  shader.fragmentShader = 'varying vec2 vReefPosition;\n' + shader.fragmentShader.replace(
    '#include <color_fragment>',
    `#include <color_fragment>
     vec2 p = vReefPosition;
     float grain = fract(sin(dot(floor(p * 230.0), vec2(127.1, 311.7))) * 43758.5453);
     float a = sin(p.x * 7.2 + sin(p.y * 4.3 + p.x * 2.6) * 1.35);
     float b = sin(p.y * 8.7 + sin(p.x * 4.8 - p.y * 3.1) * 1.58);
     float caustic = pow(max(0.0, 1.0 - abs(a * b)), 16.0);
     float ripple = sin(p.x * 26.0 + p.y * 6.2 + sin(p.y * 7.1)) * 0.045;
     diffuseColor.rgb *= 0.88 + grain * 0.15 + caustic * 0.14 + ripple;`,
  );
}

function Seabed() {
  const geometry = useMemo(() => {
    const model = new PlaneGeometry(38, 38, 84, 84);
    model.rotateX(-Math.PI / 2);
    const p = model.attributes.position;
    const colors = [];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const ripple = Math.sin(x * 1.4 + Math.cos(z * .7)) * Math.cos(z * 1.45);
      p.setY(i, ripple * .11 + seed(i) * .052);
      const tone = .72 + .09 * ripple + .13 * seed(i + 11);
      colors.push(tone * .74, tone * .89, tone * .83);
    }
    model.setAttribute('color', new BufferAttribute(Float32Array.from(colors), 3));
    model.computeVertexNormals();
    return model;
  }, []);
  return <mesh position={[0, -1.73, -4]} geometry={geometry}>
    <meshStandardMaterial vertexColors roughness={1} color="#8ab1a8" onBeforeCompile={shadeSand} />
  </mesh>;
}

export function Reef({ scan, sweep, sample, twist, holding }: { scan: number; sweep: number; sample: Point; twist: number; holding: boolean }) {
  return <>
    <Seabed />
    <Instances limit={stones.length} range={stones.length}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial roughness={.92} flatShading />
      {stones.map(({ at, scale, rotation, color }, index) => <Instance key={index} position={at} scale={scale} rotation={[.15, rotation, -.12]} color={color} />)}
    </Instances>
    <Instances limit={coral.length * 5} range={coral.length * 5}>
      <cylinderGeometry args={[.54, 1, 1, 6]} />
      <meshStandardMaterial roughness={.88} flatShading />
      {coral.flatMap(({ x, z, height, color }, index) => Array.from({ length: 5 }, (_, branch) => {
        const s = (branch - 2) * .2;
        return <Instance key={index + '-' + branch} position={[x + s * height * .55, -1.65 + height * (.27 + .02 * branch), z]} scale={[height * .056, height * (.62 + seed(index + branch) * .54), height * .062]} rotation={[s * 1.06, 0, -s * 1.6]} color={color} />;
      }))}
    </Instances>
    <Instances limit={coral.length} range={coral.length}>
      <sphereGeometry args={[1, 13, 7]} />
      <meshStandardMaterial roughness={.92} flatShading />
      {coral.map(({ x, z, height }, i) => <Instance key={i} position={[x + .49, -1.61, z + .34]} scale={[height * .62, height * .32, height * .57]} color={coralColors[(i + 3) % coralColors.length]} />)}
    </Instances>
    <Instances limit={coral.length * 6} range={coral.length * 6}>
      <sphereGeometry args={[1, 9, 6]} />
      <meshStandardMaterial roughness={.91} />
      {coral.flatMap(({ x, z, height, color }, index) => Array.from({ length: 6 }, (_, branch) => {
        const angle = branch * 1.05 + seed(index + 581) * 6;
        const width = height * (.12 + .08 * seed(index * 9 + branch));
        const up = height * (.15 + .36 * seed(index * 5 + branch + 72));
        return <Instance key={index + '-' + branch} position={[x + Math.cos(angle) * width * 1.9, -1.59 + up, z + Math.sin(angle) * width * 1.9]} scale={[width, up * .75, width * .9]} rotation={[Math.cos(angle) * .64, 0, Math.sin(angle) * .64]} color={color} />;
      }))}
    </Instances>
    <mesh name={holding ? 'Sample secured in gripper' : 'Loose demonstration sample'} position={sample} rotation={[.3 + twist, .32 + twist, -.22]}>
      <dodecahedronGeometry args={[.102, 0]} />
      <meshStandardMaterial color="#ffe4af" roughness={.69} flatShading />
    </mesh>
    {scan > .005 && <group rotation={[0, -.75 + sweep * 1.5, 0]} position={[0, -.24, .86]}>
      <mesh position={[0, -.71, 2.26]} rotation={[-.3, 0, 0]}>
        <planeGeometry args={[.065, 4.9]} />
        <meshBasicMaterial color="#7affdc" transparent opacity={scan * .4} depthWrite={false} />
      </mesh>
      <mesh position={[0, -.7, 2.26]} rotation={[-.3, 0, 0]}>
        <planeGeometry args={[.33, 4.9]} />
        <meshBasicMaterial color="#36dfc9" transparent opacity={scan * .13} depthWrite={false} />
      </mesh>
      <pointLight position={[0, -.75, 2.2]} color="#37ffd8" intensity={scan * 7} distance={3.4} />
    </group>}
  </>;
}
