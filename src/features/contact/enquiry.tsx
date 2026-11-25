'use client';

import { useRef, useState, type FormEvent } from 'react';

const subjects = ['Reef mapping', 'Infrastructure inspection', 'Marine research', 'Other'];
type Field = 'name' | 'email' | 'subject' | 'brief';
type Errors = Partial<Record<Field, string>>;

export function Enquiry() {
  const [errors, setErrors] = useState<Errors>({});
  const [confirmed, setConfirmed] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const confirmation = useRef<HTMLDivElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get('name')).trim();
    const email = String(fields.get('email')).trim();
    const subject = String(fields.get('subject'));
    const brief = String(fields.get('brief')).trim();
    const issues: Errors = {};
    if (name.length < 2) issues.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) issues.email = 'Enter an email address in the format name@example.com.';
    if (!subjects.includes(subject)) issues.subject = 'Choose a project type.';
    if (brief.length < 20) issues.brief = 'Add at least 20 characters about your project.';
    setErrors(issues);
    const first = Object.keys(issues)[0];
    if (first) {
      requestAnimationFrame(() => (form.current?.elements.namedItem(first) as HTMLElement | null)?.focus());
      return;
    }
    setConfirmed(true);
    requestAnimationFrame(() => confirmation.current?.focus());
  }

  function fieldError(field: Field) {
    return errors[field] && <span role="alert" id={field + '-error'} className="field-error">{errors[field]}</span>;
  }

  return confirmed ? <div ref={confirmation} tabIndex={-1} className="enquiry-confirmation">
    <p className="eyebrow"><span className="eyebrow-line" /> Simulation complete</p>
    <h2>Enquiry preview complete.</h2>
    <p>This form is a simulation. Your details stayed in the browser during the demo and were cleared on submission.</p>
    <button type="button" className="button button-ink" onClick={() => {
      setConfirmed(false);
      requestAnimationFrame(() => (form.current?.elements.namedItem('name') as HTMLElement | null)?.focus());
    }}>Start another enquiry</button>
  </div> : <form ref={form} onSubmit={submit} className="enquiry-form" noValidate>
    <div className="enquiry-row">
      <div className="enquiry-field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" autoComplete="name" required maxLength={120} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name && 'name-error'} />
        {fieldError('name')}
      </div>
      <div className="enquiry-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email && 'email-error'} />
        {fieldError('email')}
      </div>
    </div>
    <div className="enquiry-field">
      <label htmlFor="subject">Project type</label>
      <select id="subject" name="subject" required defaultValue="" aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject && 'subject-error'}>
        <option value="" disabled>Choose a project type</option>
        {subjects.map(subject => <option key={subject}>{subject}</option>)}
      </select>
      {fieldError('subject')}
    </div>
    <div className="enquiry-field">
      <label htmlFor="brief">Project brief</label>
      <textarea id="brief" name="brief" rows={5} required maxLength={2000} aria-invalid={Boolean(errors.brief)} aria-describedby={errors.brief ? 'brief-help brief-error' : 'brief-help'} />
      <span id="brief-help">Include a location, depth or survey objective if you have one.</span>
      {fieldError('brief')}
    </div>
    <button type="submit" className="button button-ink">Preview enquiry submission</button>
  </form>;
}
