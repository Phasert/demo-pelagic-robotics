'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

const navigation = [
  ['/', 'Home'], ['/fleet', 'Fleet'], ['/vehicle-lab', 'Vehicle Lab'], ['/missions', 'Missions'], ['/contact', 'Contact'],
] as const;

export function Wordmark() {
  return (
    <Link className="wordmark" href="/" aria-label="Pelagic Robotics home">
      <svg width="39" height="32" viewBox="0 0 54 44" aria-hidden="true">
        <path d="M2 11 27 3l25 8-13 17-12 4-12-4L2 11Zm8 2 12 5 5 15 5-15 12-5-17-5-17 5Z" fill="currentColor" fillRule="evenodd" />
        <path d="M25 32h4v9h-4z" fill="currentColor" />
      </svg>
      <span>PELAGIC <small>ROBOTICS</small></span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenPath(null);
        toggle.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <header className="site-header">
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="site-header-inner wrap">
        <Wordmark />
        <button ref={toggle} type="button" className="menu-toggle" aria-controls="site-navigation" aria-expanded={open} onClick={() => setOpenPath(open ? null : pathname)}>
          {open ? <X size={21} /> : <Menu size={21} />} <span>{open ? 'Close' : 'Menu'}</span>
        </button>
        <nav id="site-navigation" className={open ? 'site-nav is-open' : 'site-nav'} aria-label="Main navigation">
          {navigation.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpenPath(null)} aria-current={pathname === href ? 'page' : undefined} className={href === '/contact' ? 'nav-contact' : undefined}>{label}</Link>)}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div><Wordmark /><p>Marine robotics studio concept<br />Trinidad &amp; Tobago</p></div>
        <nav aria-label="Footer navigation">{navigation.slice(1).map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
        <p>Pelagic Robotics, its fleet and illustrated missions are fictional. A portfolio demo by RS Technology Group.</p>
      </div>
    </footer>
  );
}
