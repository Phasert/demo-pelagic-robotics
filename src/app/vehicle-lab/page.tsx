import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro } from '@/components/editorial';
import { Lab } from '@/features/vehicle/lab';

export const metadata: Metadata = { title: 'Vehicle Lab', description: 'Orbit the PR-01 Manta, light up its parts and operate the camera, lamps and sampling arm.' };

export default function VehicleLabPage() {
  return <>
    <PageIntro kicker="Vehicle Lab · PR–01" title="Inside the" accent="Manta." description="Orbit the vehicle, inspect its assemblies and try the same mechanisms that perform the reef expedition." />
    <Lab />
    <section className="wrap lab-exit"><p>Watch the Manta put these parts to work on the reef.</p><Link className="button button-aqua" href="/#dive">Begin the Dive</Link></section>
  </>;
}
