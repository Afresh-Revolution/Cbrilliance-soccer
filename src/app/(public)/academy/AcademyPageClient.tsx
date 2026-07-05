'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import FadeIn from '@/components/common/FadeIn';
import MediaImage from '@/components/common/MediaImage';
import { postPublicForm } from '@/lib/auth/public-form-client';
import type { AcademyFacilitiesSection } from '@/types';

const ageCategories = ['U10', 'U13', 'U15', 'U17', 'U19'];
const programs = [
  { title: 'Technical Development', desc: 'Ball mastery, first touch, and technical excellence under pressure.' },
  { title: 'Tactical Development', desc: 'Game intelligence, positional awareness, and decision-making.' },
  { title: 'Physical Conditioning', desc: 'Speed, agility, strength, and endurance tailored to age groups.' },
  { title: 'Mental Development', desc: 'Resilience, focus, and competitive mindset training.' },
  { title: 'Match Exposure', desc: 'Regular competitive fixtures against top regional academies.' },
  { title: 'Leadership Development', desc: 'Captaincy training, communication, and team responsibility.' },
];

interface Props {
  facilitiesSection: AcademyFacilitiesSection;
}

export default function AcademyPageClient({ facilitiesSection }: Props) {
  const [formState, setFormState] = useState({ loading: false, success: false, error: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({ loading: true, success: false, error: '' });
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const { ok } = await postPublicForm('/api/academy-applications', data);
      if (!ok) throw new Error('Submission failed');
      setFormState({ loading: false, success: true, error: '' });
      (e.target as HTMLFormElement).reset();
    } catch {
      setFormState({ loading: false, success: false, error: 'Failed to submit. Please try again.' });
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="label">CBFC Academy</p>
          <h1>Developing Tomorrow&apos;s <span className="text-gold">Football Stars</span></h1>
          <p>Elite youth development programmes designed to nurture talent from grassroots to professional level.</p>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="section__header">
            <p className="label">Age Categories</p>
            <h2>Find Your Programme</h2>
          </div>
          <div className="grid grid--3">
            {ageCategories.map((age, i) => (
              <FadeIn key={age} index={i}>
                <div className="age-card">
                  <div className="age-card__age">{age}</div>
                  <p>Age-appropriate training and competition</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <div className="section__header">
            <p className="label">Programmes</p>
            <h2>Academy Development Pillars</h2>
          </div>
          <div className="grid grid--3">
            {programs.map((prog, i) => (
              <FadeIn key={prog.title} index={i}>
                <div className="program-card">
                  <h3>{prog.title}</h3>
                  <p>{prog.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="section__header">
            <p className="label">{facilitiesSection.sectionLabel}</p>
            <h2>{facilitiesSection.sectionHeading}</h2>
          </div>
          <div className="grid grid--3">
            {facilitiesSection.facilities.map((facility, i) => (
              <FadeIn key={facility.id} index={i}>
                <div className="facility-card">
                  <MediaImage src={facility.imageUrl} alt={facility.name} fill sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="facility-card__label">{facility.name}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--surface" id="register">
        <div className="container">
          <div className="section__header">
            <p className="label">Registration</p>
            <h2>Apply To Join Academy</h2>
          </div>
          <form className="form" onSubmit={handleSubmit} style={{ maxWidth: 640, margin: '0 auto' }}>
            {formState.success && (
              <div className="form__success">Application submitted successfully! We will be in touch.</div>
            )}
            {formState.error && <div className="form__error">{formState.error}</div>}
            <div className="form__row">
              <div className="form__group">
                <label className="form__label" htmlFor="fullName">Full Name</label>
                <input className="form__input" id="fullName" name="fullName" required />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="dateOfBirth">Date of Birth</label>
                <input className="form__input" id="dateOfBirth" name="dateOfBirth" type="date" required />
              </div>
            </div>
            <div className="form__row">
              <div className="form__group">
                <label className="form__label" htmlFor="position">Position</label>
                <select className="form__select" id="position" name="position" required>
                  <option value="goalkeeper">Goalkeeper</option>
                  <option value="defender">Defender</option>
                  <option value="midfielder">Midfielder</option>
                  <option value="forward">Forward</option>
                </select>
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="height">Height</label>
                <input className="form__input" id="height" name="height" placeholder="e.g. 1.75m" />
              </div>
            </div>
            <div className="form__row">
              <div className="form__group">
                <label className="form__label" htmlFor="preferredFoot">Preferred Foot</label>
                <select className="form__select" id="preferredFoot" name="preferredFoot">
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="parentGuardianName">Parent/Guardian Name</label>
                <input className="form__input" id="parentGuardianName" name="parentGuardianName" required />
              </div>
            </div>
            <div className="form__row">
              <div className="form__group">
                <label className="form__label" htmlFor="email">Email</label>
                <input className="form__input" id="email" name="email" type="email" required />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="phone">Phone Number</label>
                <input className="form__input" id="phone" name="phone" type="tel" required />
              </div>
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="previousClub">Previous Club</label>
              <input className="form__input" id="previousClub" name="previousClub" />
            </div>
            <Button type="submit" full disabled={formState.loading}>
              {formState.loading ? 'Submitting...' : 'Apply To Join Academy'}
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
