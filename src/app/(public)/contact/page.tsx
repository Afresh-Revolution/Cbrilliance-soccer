'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import { postPublicForm } from '@/lib/auth/public-form-client';
import {
  SOCIAL_LINKS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  WHATSAPP_NUMBER,
} from '@/lib/constants/contact';

export default function ContactPage() {
  const [formState, setFormState] = useState({ loading: false, success: false, error: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({ loading: true, success: false, error: '' });

    try {
      const formData = new FormData(e.currentTarget);
      const { ok } = await postPublicForm('/api/contact', Object.fromEntries(formData));
      if (!ok) throw new Error('Failed');
      setFormState({ loading: false, success: true, error: '' });
      (e.target as HTMLFormElement).reset();
    } catch {
      setFormState({ loading: false, success: false, error: 'Failed to send message.' });
    }
  }

  const email = SUPPORT_EMAIL;
  const phone = SUPPORT_PHONE;
  const whatsapp = WHATSAPP_NUMBER;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="label">Get In Touch</p>
          <h1>Contact <span className="text-gold">CBFC</span></h1>
          <p>Reach out to our Academy, Agency, or Professional Club divisions.</p>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="contact-grid">
            <form className="form" onSubmit={handleSubmit}>
              {formState.success && (
                <div className="form__success">Message sent! We&apos;ll be in touch soon.</div>
              )}
              {formState.error && <div className="form__error">{formState.error}</div>}
              <div className="form__row">
                <div className="form__group">
                  <label className="form__label" htmlFor="fullName">Full Name</label>
                  <input className="form__input" id="fullName" name="fullName" required />
                </div>
                <div className="form__group">
                  <label className="form__label" htmlFor="organization">Organization</label>
                  <input className="form__input" id="organization" name="organization" />
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
                {formState.loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>

            <div className="contact-info">
              <div className="contact-info__item">
                <div className="contact-info__icon">EM</div>
                <div>
                  <p className="contact-info__label">Email</p>
                  <a href={`mailto:${email}`}>{email}</a>
                </div>
              </div>
              <div className="contact-info__item">
                <div className="contact-info__icon">PH</div>
                <div>
                  <p className="contact-info__label">Phone</p>
                  <a href={`tel:${phone}`}>{phone}</a>
                </div>
              </div>
              <div className="contact-info__item">
                <div className="contact-info__icon">WA</div>
                <div>
                  <p className="contact-info__label">WhatsApp</p>
                  <a href={`https://wa.me/${whatsapp}`}>Chat on WhatsApp</a>
                </div>
              </div>
              <div className="contact-info__item">
                <div className="contact-info__icon">AD</div>
                <div>
                  <p className="contact-info__label">Office Address</p>
                  <p>CBFC Headquarters, Football District, Lagos, Nigeria</p>
                </div>
              </div>
              <div className="contact-info__item">
                <div className="contact-info__icon">SM</div>
                <div>
                  <p className="contact-info__label">Social Media</p>
                  <div className="contact-info__social">
                    {SOCIAL_LINKS.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.ariaLabel}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="map-placeholder mt-xl">
            Google Maps integration ready. Embed your map iframe here.
          </div>
        </div>
      </section>
    </>
  );
}
