import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ContactBand, PageIntro } from '@/components/editorial';
import { missions } from '@/lib/content';

export const metadata: Metadata = { title: 'Missions', description: 'Three fictional subsea missions inspired by the waters around Trinidad and Tobago.' };

export default function MissionsPage() {
  return <>
    <PageIntro kicker="Mission stories" title="Fieldwork in" accent="Caribbean waters." description="Three illustrative scenarios show what crews could document, inspect and recover using a subsea vehicle." />
    <section className="light-section mission-detail-section" aria-label="Illustrative mission stories">
      <div className="wrap mission-stories">
        {missions.map(mission => <article className="mission-entry" key={mission.slug} id={mission.slug}>
          <div className="mission-entry-image"><Image src={mission.image} alt={mission.alt} fill sizes="(max-width: 700px) 100vw, 55vw" unoptimized /></div>
          <div className="mission-entry-copy">
            <p className="eyebrow">{mission.type} · {mission.location}</p><h2>{mission.title}</h2><p>{mission.description}</p>
            <dl><div><dt>Field plan</dt><dd>{mission.plan}</dd></div><div><dt>Deliverable</dt><dd>{mission.result}</dd></div></dl>
            {mission.slug === 'research' && <Link className="button button-ink" href="/#dive">See the sample pickup</Link>}
          </div>
        </article>)}
      </div>
    </section>
    <ContactBand />
  </>;
}
