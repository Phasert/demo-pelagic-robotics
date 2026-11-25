import Link from 'next/link';

export default function NotFound() {
  return <section className="page-intro missing"><div className="wrap page-intro-inner">
    <p className="eyebrow"><span className="eyebrow-line" /> 404 · Page unavailable</p>
    <h1>Signal <em>lost.</em></h1><p>The requested page could not be found.</p>
    <Link href="/" className="button button-aqua">Return to the surface</Link>
  </div></section>;
}
