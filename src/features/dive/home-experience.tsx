'use client';

import Link from 'next/link';
import { ChevronDown, Crosshair, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { stages } from '@/lib/content';
import { Graphics, usePause } from '@/features/vehicle/graphics';
import { missionAt, missionEnd, stageStops } from './timeline';

function MotionButton({ compact = false }: { compact?: boolean }) {
  const [paused, toggle] = usePause();
  return <button type="button" className={compact ? 'motion-button compact' : 'motion-button'} onClick={toggle} aria-pressed={paused}>
    {paused ? <Play size={15} fill="currentColor" aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
    <span>{paused ? 'Resume motion' : 'Pause motion'}</span>
  </button>;
}

export function Hero() {
  return <section className="hero" aria-labelledby="hero-heading">
    <div className="hero-ripples" aria-hidden="true" />
    <Graphics mode="hero" className="hero-graphics" poster="/media/manta.webp" posterAlt="PR-01 Manta, a compact subsea robot with an orange protective frame." />
    <div className="hero-frame" aria-hidden="true"><i /><i /><i /><i /><span /><span /></div>
    <div className="wrap hero-inner">
      <div className="hero-copy">
        <p className="eyebrow"><span className="eyebrow-line" /> Trinidad &amp; Tobago <span className="eyebrow-divider" /> Marine Robotics</p>
        <h1 id="hero-heading">Built for<br />the <em>Deep.</em></h1>
        <p className="hero-deck">Meet the PR-01 Manta. Follow our subsea vehicle from the surface to a Caribbean reef.</p>
        <div className="hero-actions">
          <a className="button button-aqua" href="#dive">Begin the Dive <ChevronDown size={16} aria-hidden="true" /></a>
          <Link className="button button-outline" href="/fleet">Explore the Fleet</Link>
        </div>
        <MotionButton />
      </div>
      <div className="hero-side-label" aria-hidden="true"><Crosshair size={15} /> <span>VEHICLE IN FRAME</span></div>
      <div className="hero-readout">
        <span className="readout-tag"><i /> <span>SURFACE CHECK</span></span>
        <span className="readout-name">PR–01 <strong>MANTA</strong></span>
        <span className="readout-detail">Tethered survey ROV</span>
      </div>
    </div>
    <div className="hero-strip">
      <div className="wrap hero-strip-inner">
        <div><span>PLATFORM</span> <strong>Observation + sampling</strong></div>
        <div><span>OPERATING RATING</span> <strong>120 m</strong></div>
        <div><span>EXPEDITION</span> <strong>Caribbean reef</strong></div>
        <a href="#dive">Scroll to dive <ChevronDown size={16} aria-hidden="true" /></a>
      </div>
    </div>
  </section>;
}

export function Dive() {
  const sequence = useRef<HTMLDivElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const scene = missionAt(progress);
  const index = scene.segment;
  const stage = stages[index];

  const getSpan = useCallback(() => {
    const track = sequence.current;
    const panel = sticky.current;
    if (!track || !panel) return;
    const header = Number.parseFloat(getComputedStyle(panel).top) || 0;
    return { start: scrollY + track.getBoundingClientRect().top - header, distance: track.offsetHeight - panel.offsetHeight };
  }, []);

  useEffect(() => {
    let frame = 0;
    const sync = () => {
      frame = 0;
      const bounds = getSpan();
      if (bounds && bounds.distance > 1) setProgress(Math.min(missionEnd, Math.max(0, (scrollY - bounds.start) / bounds.distance * missionEnd)));
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(sync); };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    request();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, [getSpan]);

  function seek(point: number) {
    const span = getSpan();
    if (!span) return;
    setProgress(point);
    if (span.distance > 1) window.scrollTo({ top: span.start + span.distance * point / missionEnd, behavior: 'instant' });
  }

  return <section id="dive" className="dive" aria-labelledby="dive-heading">
    <div className="wrap dive-intro">
      <div><p className="eyebrow"><span className="eyebrow-line" /> The reef expedition</p><h2 id="dive-heading">Below the <em>surface.</em></h2></div>
      <p>Follow Manta down to the reef and back. Scroll to advance or rewind the dive, or choose a stage to jump directly to it.</p>
    </div>
    <div ref={sequence} className="dive-track">
      <div ref={sticky} className="dive-sticky">
        <div className="wrap dive-console">
          <div className="dive-stage-tabs" role="group" aria-label="Dive stages">
            {stages.map(({ name }, i) => <button type="button" key={name} aria-current={i === index ? 'step' : undefined} onClick={() => seek(stageStops[i])}><span>{String(i + 1).padStart(2, '0')}</span>{name}</button>)}
          </div>
          <div className="dive-deck">
            <Graphics mode="dive" className="dive-graphics" progress={progress} poster={'/media/dive-' + stage.name.toLowerCase() + '.webp'} posterAlt={stage.imageAlt}>
              <div className="dive-visual-tone" style={{ '--depth-tint': scene.darkness } as CSSProperties} />
              <div className="dive-hud"><Crosshair aria-hidden="true" size={16} /><span>{stage.name === 'Return' && progress < 4.88 ? 'Ascending' : scene.holding && index === 3 ? 'Sample secured' : stage.channel}</span></div>
              <div className="depth-hud"><span>DEPTH</span><strong>{String(scene.depth).padStart(2, '0')} <small>m</small></strong></div>
            </Graphics>
            <div className="dive-story">
              <div aria-live="polite" aria-atomic="true">
                <p className="eyebrow">{stage.name} · ~{stage.depth} m</p>
                <h3>{stage.title}</h3>
                <p>{stage.text}</p>
              </div>
              <div className="dive-controls">
                <button type="button" className="button button-outline" disabled={index === 0} onClick={() => seek(stageStops[index - 1])}>Previous</button>
                <button type="button" className="button button-outline" disabled={index === stages.length - 1} onClick={() => seek(stageStops[index + 1])}>Next</button>
              </div>
              <a className="quiet-link" href="#mission-summary">Skip to mission summary</a>
            </div>
          </div>
          <div className="dive-scrub">
            <label htmlFor="dive-position">Dive position</label>
            <input id="dive-position" type="range" min={0} max={missionEnd} step=".01" value={progress} aria-valuetext={stage.name} onChange={event => seek(event.currentTarget.valueAsNumber)} />
            <MotionButton compact />
          </div>
        </div>
      </div>
    </div>
    <div id="mission-summary" className="wrap dive-summary">
      <div><p className="eyebrow"><span className="eyebrow-line" /> Dive log · Caribbean reef</p><h2>Back at the surface.</h2></div>
      <dl><div><dt>Max depth</dt><dd>28 m</dd></div><div><dt>Reef transect</dt><dd>Complete</dd></div><div><dt>Loose sample</dt><dd>Recovered</dd></div></dl>
    </div>
  </section>;
}
