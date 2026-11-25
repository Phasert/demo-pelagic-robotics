import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ContactBand, PageIntro } from '@/components/editorial';
import { fleet } from '@/lib/content';

export const metadata: Metadata = { title: 'Fleet', description: 'Meet Manta, Needle and Skate, three fictional subsea vehicles built for distinct survey and research roles.' };

export default function FleetPage() {
  return <>
    <PageIntro kicker="Vehicle fleet" title="Three machines." accent="Three roles." description="A fictional fleet for close reef work, longer survey lines and shallow-water observation. All ratings are illustrative design specifications." />
    <section className="light-section fleet-section" aria-label="Vehicle specifications">
      <div className="wrap fleet-grid">
        {fleet.map((vehicle, index) => <article className={'fleet-card ' + (index === 0 ? 'fleet-featured' : '')} key={vehicle.id}>
          <div className="fleet-image"><Image src={vehicle.image} alt={vehicle.alt} fill sizes={index === 0 ? '(max-width: 700px) 100vw, 62vw' : '(max-width: 700px) 100vw, 48vw'} unoptimized /><span className="eyebrow">{vehicle.id}</span></div>
          <div className="fleet-copy">
            <p className="eyebrow">{vehicle.role}</p><h2>{vehicle.name}</h2><p>{vehicle.description}</p>
            <dl><div><dt>Max depth</dt><dd>{vehicle.depth}</dd></div><div><dt>Length</dt><dd>{vehicle.size}</dd></div><div><dt>Dry mass</dt><dd>{vehicle.mass}</dd></div></dl>
            {index === 0 && <Link className="button button-ink" href="/vehicle-lab">Inspect Manta</Link>}
          </div>
        </article>)}
      </div>
    </section>
    <ContactBand />
  </>;
}
