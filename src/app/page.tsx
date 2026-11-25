import Image from 'next/image';
import Link from 'next/link';
import { ContactBand, MissionCards } from '@/components/editorial';
import { Dive, Hero } from '@/features/dive/home-experience';

export default function Home() {
  return <>
    <Hero />
    <Dive />
    <section className="light-section">
      <div className="wrap home-vehicle">
        <div className="home-vehicle-image">
          <Image src="/media/manta.webp" alt="The Manta’s orange protective cage surrounds its central pressure housing." fill sizes="(max-width: 700px) 100vw, 55vw" unoptimized />
          <span className="eyebrow">PR–01 / Tethered ROV</span>
        </div>
        <div className="home-vehicle-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> Inside the Manta</p>
          <h2>Meet your dive partner.</h2>
          <p>Manta is an observation and sampling vehicle with an open protective frame, four ducted thrusters and a jointed sampling arm.</p>
          <p>Open the lab to orbit the vehicle, try its controls and take the major assemblies apart.</p>
          <Link className="button button-ink" href="/vehicle-lab">Open Vehicle Lab</Link>
        </div>
      </div>
    </section>
    <section className="wrap home-missions">
      <div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> Mission stories</p><h2>Three reasons to go below.</h2></div><Link className="button button-outline" href="/missions">Explore missions</Link></div>
      <MissionCards />
    </section>
    <ContactBand />
  </>;
}
