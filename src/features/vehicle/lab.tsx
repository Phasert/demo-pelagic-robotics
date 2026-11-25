'use client';

import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { parts, type Part } from '@/lib/content';
import { Graphics } from './graphics';
import type { View } from './scene';

const presets: { id: View; label: string }[] = [
  { id: 'quarter', label: 'Three-quarter' }, { id: 'front', label: 'Front' }, { id: 'side', label: 'Side' }, { id: 'top', label: 'Top' },
];

export function Lab() {
  const [view, setView] = useState<View>('quarter');
  const [reset, setReset] = useState(0);
  const [selected, setSelected] = useState<Part>('housing');
  const [lamp, setLamp] = useState(true);
  const [turn, setTurn] = useState(0);
  const [deployed, setDeployed] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [touch, setTouch] = useState(false);
  const [touchOrbit, setTouchOrbit] = useState(false);

  useEffect(() => {
    const media = matchMedia('(any-pointer: coarse)');
    const sync = () => setTouch(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const orbitEnabled = !touch || touchOrbit;
  const part = parts.find(item => item.id === selected)!;

  function chooseView(next: View) {
    setView(next);
    setReset(value => value + 1);
  }

  return <section className="wrap lab" aria-label="Manta vehicle inspection">
    <div className="lab-main">
      <div className="lab-viewbar">
        <div className="preset-group" role="group" aria-label="Camera views">
          {presets.map(({ id, label }) => <button type="button" key={id} aria-pressed={view === id} onClick={() => chooseView(id)}>{label}</button>)}
        </div>
        <button className="reset-button" type="button" onClick={() => chooseView('quarter')}><RotateCcw size={16} /> Reset view</button>
      </div>
      <Graphics className={'lab-graphics ' + (orbitEnabled ? 'orbit-enabled' : 'orbit-disabled')} mode="lab" poster={view === 'quarter' ? '/media/manta.webp' : '/media/manta-' + view + '.webp'} posterAlt={presets.find(preset => preset.id === view)?.label + ' illustration of the Manta ROV.'} lab={{ view, reset, selected, lamp, turn: turn * Math.PI / 180, deployed, exploded, orbitEnabled }} onSelect={setSelected}>
        <div className="lab-viewport-label"><span>PR–01</span> MANTA</div>
      </Graphics>
      <div className="lab-viewnote">
        <p>{touch ? touchOrbit ? 'Drag inside the model to orbit. Scroll outside the viewer.' : 'Use the preset views or enable touch orbit.' : 'Drag to orbit. Select a part in the model or in the parts list.'}</p>
        {touch && <button type="button" className="quiet-link" aria-pressed={touchOrbit} onClick={() => setTouchOrbit(value => !value)}>{touchOrbit ? 'Disable touch orbit' : 'Enable touch orbit'}</button>}
      </div>
    </div>
    <aside className="lab-panel">
      <div className="lab-live-controls">
        <h2>Vehicle controls</h2>
        <div className="lab-toggles">
        <button type="button" aria-pressed={lamp} onClick={() => setLamp(value => !value)}><span>Lamps</span><strong>{lamp ? 'On' : 'Off'}</strong></button>
        <button type="button" aria-pressed={deployed} onClick={() => setDeployed(value => !value)}><span>Sampling arm</span><strong>{deployed ? 'Retract' : 'Deploy'}</strong></button>
        <button type="button" aria-pressed={exploded} onClick={() => setExploded(value => !value)}><span>Exploded view</span><strong>{exploded ? 'Reassemble' : 'Separate'}</strong></button>
        </div>
        <label htmlFor="pod-angle" className="pod-label">Camera pod rotation <output htmlFor="pod-angle">{turn}°</output></label>
        <input className="lab-range" id="pod-angle" type="range" min="-75" max="75" value={turn} onChange={event => setTurn(event.currentTarget.valueAsNumber)} />
      </div>
      <div className="parts">
        <h2>Parts list</h2>
        <div className="parts-list" role="group" aria-label="Model parts">{parts.map(item => <button type="button" key={item.id} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>{item.title}</button>)}</div>
        <div className="part-detail" aria-live="polite"><h3>{part.title}</h3><p>{part.description}</p></div>
      </div>
      <p className="lab-fallback-note">The illustrations show fixed poses. Live adjustments require WebGL and motion enabled.</p>
    </aside>
  </section>;
}
