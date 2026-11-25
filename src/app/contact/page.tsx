import type { Metadata } from 'next';
import { PageIntro } from '@/components/editorial';
import { Enquiry } from '@/features/contact/enquiry';

export const metadata: Metadata = { title: 'Contact', description: 'Try Pelagic Robotics’ simulated subsea project enquiry form.' };

export default function ContactPage() {
  return <>
    <PageIntro kicker="Project enquiries" title="What’s your" accent="objective?" description="Tell us what you would like to observe, inspect or recover below the surface." />
    <section className="light-section contact-section"><div className="wrap contact-grid">
      <div><p className="eyebrow"><span className="eyebrow-line" /> Trinidad &amp; Tobago</p><h2>Share your brief.</h2><p>Pelagic Robotics is a fictional studio. Use this form to try the enquiry workflow with sample details. Submitting it shows a simulated confirmation.</p></div>
      <Enquiry />
    </div></section>
  </>;
}
