# Pelagic Robotics

**Built for the Deep.** Pelagic Robotics is a fictional Trinidad and Tobago marine robotics studio created as a portfolio demonstration for RS Technology Group. The vehicles, ratings, expedition and mission stories are illustrative. The contact form simulates submission in the browser.

## Run locally

Use Bun 1.3 or later and Node.js 20.9 or later.

```sh
bun install --frozen-lockfile
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). For a production preview, run `bun run build` followed by `bun run start`. The project uses no environment variables or external services at runtime.

| Script | Purpose |
| --- | --- |
| `bun run dev` | Next.js development server |
| `bun run lint` | ESLint throughout the project |
| `bun run typecheck` | Generate Next.js route types and check TypeScript |
| `bun test` | Check timeline boundaries, contact continuity and sample recovery in both directions |
| `bun run build` | Compile an optimized production build |
| `bun run start` | Serve the production build locally |

## The expedition and lab

- Home opens on a live three-quarter shot of the PR-01 Manta. A timed sequence starts the rotors, settles the camera and lights the lamps. **Pause motion** freezes ambient motion and remembers the setting in this browser.
- **Begin the Dive** opens the five-stage expedition. Scroll, use the position slider, or choose a stage. The Previous and Next buttons can be used with the keyboard. **Skip to mission summary** exits the sequence.
- The timeline maps normalized scroll progress to world position, camera, light, depth, survey and manipulator state. The seafloor sample becomes attached to the computed gripper position at contact. The same calculation releases the sample when crossing the contact point in reverse.
- **Vehicle Lab** shares the same procedural model. Drag to orbit, choose one of four views, or select a part from the live model or the parts list. Toggle the lamps, adjust the pod, deploy the arm, or separate and reassemble the principal subassemblies. On a touch screen the viewer starts in page-scroll mode and enables orbit on request.

The presentation is built with Next.js App Router, TypeScript, Tailwind CSS v4, Three.js, React Three Fiber and Drei. Model and inverse kinematics live in `src/features/vehicle`. The reef, scroll console and timeline live in `src/features/dive`. Shared editorial data lives in `src/lib/content.ts`.

## Accessibility and rendering

The headings, controls and mission descriptions are HTML alongside the canvas. All controls have visible focus styles. Reduced-motion and WebGL-unavailable visitors get five local stage posters, the full timeline controls, a parts list and four illustrated lab views. Add `?graphics=off` to a page URL to preview the WebGL-unavailable path. Lab adjustments appear with live graphics. Canvas scenes load near the viewport, render on demand while idle, and cap pixel density on smaller screens.

## Asset credits

- The Pelagic wordmark, favicon, procedural Manta, reef geometry, livery, stage posters and lab views were created for this demonstration. The posters and illustrated presets are renders from the local scenes. No third-party meshes, typeface files, photographs or texture libraries are bundled.
- The ocean plate, three mission illustrations and Needle and Skate concept art were generated for the demo using OpenAI ImageGen and encoded as WebP. [OpenAI terms for generated output](https://openai.com/policies/terms-of-use/).
- Interface icons come from [Lucide](https://lucide.dev/license), under the ISC license with the project’s documented MIT exceptions for inherited icons. Typography resolves to system fonts.
- Framework and rendering libraries retain their respective licenses. Next.js, React, Tailwind CSS, Three.js, React Three Fiber and Drei are MIT-licensed. See their package notices and the Bun lockfile for the exact packages.
