import Image from 'next/image';
import Link from 'next/link';
import { missions } from '@/lib/content';

export function PageIntro({ kicker, title, accent, description }: { kicker: string; title: string; accent?: string; description: string }) {
  return <section className="page-intro">
    <div className="wrap page-intro-inner"><p className="eyebrow"><span className="eyebrow-line" /> {kicker}</p><h1>{title}{accent && <> <em>{accent}</em></>}</h1><p>{description}</p></div>
  </section>;
}

export function MissionCards() {
  return <div className="mission-grid">
    {missions.map(mission => <article className="mission-card" key={mission.slug}>
      <Link href={'/missions#' + mission.slug} className="mission-picture" aria-label={'Read about ' + mission.title}>
        <Image src={mission.image} alt={mission.alt} fill sizes="(max-width: 700px) 100vw, 33vw" unoptimized />
      </Link>
      <div className="mission-card-copy">
        <p className="eyebrow">{mission.type}</p><h3><Link href={'/missions#' + mission.slug}>{mission.title}</Link></h3><p>{mission.description}</p>
      </div>
    </article>)}
  </div>;
}

export function ContactBand() {
  return <section className="contact-band"><div className="wrap contact-band-inner">
    <div><p className="eyebrow"><span className="eyebrow-line" /> Enquiries</p><h2>Plan a subsea project.</h2></div>
    <Link className="button button-aqua" href="/contact">Start an enquiry</Link>
  </div></section>;
}
