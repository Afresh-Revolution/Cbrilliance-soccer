'use client';

import { useState } from 'react';
import FadeIn from '@/components/common/FadeIn';
import Button from '@/components/common/Button';
import { postPublicForm } from '@/lib/auth/public-form-client';

const services = [
  { title: 'Player Representation', desc: 'Full-service representation for developing and professional players.' },
  { title: 'Trial Placement', desc: 'Connecting players with trial opportunities at clubs worldwide.' },
  { title: 'Club Networking', desc: 'Established relationships with clubs across Europe, Asia, and Africa.' },
  { title: 'International Opportunities', desc: 'Opening doors to international leagues and competitions.' },
  { title: 'Career Development', desc: 'Strategic career planning and progression guidance.' },
  { title: 'Contract Support', desc: 'Professional contract negotiation and advisory services.' },
];

export default function AgencyPage() {
  const [formState, setFormState] = useState({ loading: false, success: false, error: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({ loading: true, success: false, error: '' });
    const formData = new FormData(e.currentTarget);

    try {
      const { ok } = await postPublicForm('/api/scout-inquiries', Object.fromEntries(formData));
      if (!ok) throw new Error('Failed');
      setFormState({ loading: false, success: true, error: '' });
      (e.target as HTMLFormElement).reset();
    } catch {
      setFormState({ loading: false, success: false, error: 'Failed to submit inquiry.' });
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="label">CBFC Agency</p>
          <h1>Representing <span className="text-gold">Elite Talent</span></h1>
          <p>Professional player representation, scouting exposure, and international career pathways.</p>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="section__header">
            <p className="label">Services</p>
            <h2>What We Offer</h2>
          </div>
          <div className="grid grid--3">
            {services.map((s, i) => (
              <FadeIn key={s.title} index={i}>
                <div className="service-card">
                  <div className="service-card__icon">{String(i + 1).padStart(2, '0')}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <div className="section__header">
            <p className="label">Scout Inquiry</p>
            <h2>Request A Player</h2>
          </div>
          <form className="form inquiry-form" onSubmit={handleSubmit}>
            {formState.success && (
              <div className="form__success">Inquiry submitted! Our agency team will respond shortly.</div>
            )}
            {formState.error && <div className="form__error">{formState.error}</div>}
            <div className="form__row">
              <div className="form__group">
                <label className="form__label" htmlFor="scoutName">Scout Name</label>
                <input className="form__input" id="scoutName" name="scoutName" required />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="clubName">Club Name</label>
                <input className="form__input" id="clubName" name="clubName" required />
              </div>
            </div>
            <div className="form__row">
              <div className="form__group">
                <label className="form__label" htmlFor="email">Email</label>
                <input className="form__input" id="email" name="email" type="email" required />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="phone">Phone</label>
                <input className="form__input" id="phone" name="phone" type="tel" />
              </div>
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="message">Message</label>
              <textarea className="form__textarea" id="message" name="message" required />
            </div>
            <Button type="submit" full disabled={formState.loading}>
              {formState.loading ? 'Submitting...' : 'Request Player'}
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
