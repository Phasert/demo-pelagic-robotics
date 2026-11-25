'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { Part } from '@/lib/content';
import type { LabState } from './scene';

const Scene = dynamic(() => import('./scene'), { ssr: false });
const pauseKey = 'pelagic-motion-paused';
const pauseEvent = 'pelagic:motion';

function subscribePause(update: () => void) {
  window.addEventListener(pauseEvent, update);
  window.addEventListener('storage', update);
  return () => {
    window.removeEventListener(pauseEvent, update);
    window.removeEventListener('storage', update);
  };
}

let inMemoryPause = false;
function readPause() {
  try { return localStorage.getItem(pauseKey) === '1'; }
  catch { return inMemoryPause; }
}

export function usePause() {
  const paused = useSyncExternalStore(subscribePause, readPause, () => false);
  const toggle = () => {
    const next = !readPause();
    inMemoryPause = next;
    try { localStorage.setItem(pauseKey, next ? '1' : '0'); } catch { /* session memory still works */ }
    window.dispatchEvent(new Event(pauseEvent));
  };
  return [paused, toggle] as const;
}

type GraphicsStatus = 'loading' | 'live' | 'reduced' | 'unavailable';

function checkWebGL() {
  try {
    if (new URLSearchParams(location.search).get('graphics') === 'off') return false;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false });
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(context);
  } catch { return false; }
}

type GraphicsProps = {
  mode: 'hero' | 'dive' | 'lab'; className?: string;
  progress?: number; lab?: LabState; onSelect?: (part: Part) => void;
  poster: string; posterAlt?: string; children?: ReactNode;
};

export function Graphics({ mode, className, progress, lab, onSelect, poster, posterAlt = '', children }: GraphicsProps) {
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  const [nearby, setNearby] = useState(false);
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState<{ reduced: boolean; mobile: boolean; webgl: boolean }>();
  const [frameReady, setFrameReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused] = usePause();

  useEffect(() => {
    if (!anchor) return;
    const inView = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .01 });
    const near = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNearby(true);
      near.disconnect();
    }, { rootMargin: '160px' });
    inView.observe(anchor);
    near.observe(anchor);
    return () => { inView.disconnect(); near.disconnect(); };
  }, [anchor]);

  useEffect(() => {
    if (!nearby) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 700px)');
    let webgl: boolean | undefined;
    function update() {
      if (!reduced.matches && webgl === undefined) webgl = checkWebGL();
      setPreferences({ reduced: reduced.matches, mobile: mobile.matches, webgl: webgl ?? false });
    }
    update();
    reduced.addEventListener('change', update);
    mobile.addEventListener('change', update);
    return () => { reduced.removeEventListener('change', update); mobile.removeEventListener('change', update); };
  }, [nearby]);

  const onReady = useCallback(() => setFrameReady(true), []);
  const onFailure = useCallback(() => setFailed(true), []);
  let status: GraphicsStatus = 'loading';
  if (preferences?.reduced) status = 'reduced';
  else if (failed || preferences?.webgl === false) status = 'unavailable';
  else if (frameReady) status = 'live';
  const showCanvas = Boolean(nearby && preferences?.webgl && !preferences.reduced && !failed);

  return (
    <div ref={setAnchor} className={['graphics', className].filter(Boolean).join(' ')} data-graphics={status} data-mode={mode}>
      {status !== 'live' && <Image className="graphics-poster" src={poster} alt={posterAlt} fill sizes={mode === 'hero' ? '(max-width: 700px) 100vw, 65vw' : '(max-width: 700px) 100vw, 70vw'} priority={mode === 'hero'} unoptimized />}
      {showCanvas && <div className="graphics-canvas" data-active={visible && !paused}>
        <Scene mode={mode} visible={visible} paused={paused} mobile={preferences!.mobile} progress={progress} lab={lab} onSelect={onSelect} onReady={onReady} onFailure={onFailure} />
      </div>}
      {status !== 'live' && <span className="graphics-status">{status === 'loading' ? 'Preparing open-water view' : 'Illustrated view'}</span>}
      {children}
    </div>
  );
}
