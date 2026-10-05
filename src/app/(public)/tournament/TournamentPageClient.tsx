'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import { postPublicFormData } from '@/lib/auth/public-form-client';
import { formatNaira, TOURNAMENT_FEE_NAIRA, TOURNAMENT_TITLE } from '@/lib/tournament/constants';
import type { TournamentBankDetails } from '@/types';

const POSITIONS = [
  { value: 'team_manager', label: 'Team Manager' },
  { value: 'coach', label: 'Coach' },
  { value: 'team_representative', label: 'Team Representative' },
  { value: 'club_official', label: 'Club Official' },
] as const;

const PLAYER_COUNTS = [15, 16, 17, 18];

interface SubmitResult {
  registrationCode: string;
  squadPath: string;
}

function errorMessage(data: unknown): string {
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    return data.error;
  }
  return 'Failed to submit. Please try again.';
}

export default function TournamentPageClient({
  bankDetails,
}: {
  bankDetails: TournamentBankDetails;
}) {
  const hasBankDetails = Boolean(
    bankDetails.bankName && bankDetails.accountName && bankDetails.accountNumber,
  );
  const [formState, setFormState] = useState({ loading: false, error: '' });
  const [result, setResult] = useState<SubmitResult | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (formData.getAll('officialPositions').length === 0) {
      setFormState({ loading: false, error: 'Select at least one position.' });
      return;
    }

    setFormState({ loading: true, error: '' });
    try {
      const { ok, data } = await postPublicFormData<SubmitResult & { error?: string }>(
        '/api/tournament/registrations',
        formData,
      );
      if (!ok || !data.registrationCode || !data.squadPath) {
        throw new Error(errorMessage(data));
      }
      setResult({ registrationCode: data.registrationCode, squadPath: data.squadPath });
      setFormState({ loading: false, error: '' });
    } catch (error) {
      setFormState({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to submit. Please try again.',
      });
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="label">Tournament</p>
          <h1>CBrilliance Football Agency <span className="text-gold">Tournament</span></h1>
          <p>
            Welcome to the official registration portal for the “{TOURNAMENT_TITLE}”.
            Please provide accurate information about your team and officials. Submission of this form does not automatically confirm participation. Registration is subject to verification and approval by the Tournament Committee.
          </p>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          {result ? (
            <div className="tournament-success">
              <p className="tournament-success__title">Registration Submitted Successfully! ⚽</p>
              <p>
                Your team registration has been received by the CBrilliance Football Agency Tournament Committee.
              </p>
              <p className="tournament-success__id">
                Registration ID: <strong>{result.registrationCode}</strong>
              </p>
              <p>
                Your registration will be reviewed by the Tournament Committee. You will receive confirmation and further instructions through your registered phone number/WhatsApp or email.
              </p>
              <p>
                Use your squad dashboard to add players one at a time. A copy of this link is emailed when an email address was provided.
              </p>
              <Button href={result.squadPath}>Open squad dashboard</Button>
            </div>
          ) : (
            <form className="form tournament-form" onSubmit={handleSubmit}>
              {formState.error && <div className="form__error">{formState.error}</div>}

              <div className="tournament-form__section">
                <h2>1. Team information</h2>
                <div className="form__group">
                  <label className="form__label" htmlFor="teamName">Team Name*</label>
                  <input className="form__input" id="teamName" name="teamName" placeholder="Enter team name" required />
                </div>
                <div className="form__row">
                  <div className="form__group">
                    <label className="form__label" htmlFor="teamShortName">Team Short Name / Abbreviation</label>
                    <input className="form__input" id="teamShortName" name="teamShortName" placeholder="e.g. CBFC" maxLength={20} />
                  </div>
                  <div className="form__group">
                    <label className="form__label" htmlFor="teamLocation">Team/Club Location*</label>
                    <input className="form__input" id="teamLocation" name="teamLocation" placeholder="City / Area" required />
                  </div>
                </div>
                <div className="form__group">
                  <label className="form__label" htmlFor="homeGround">Home Ground / Training Location</label>
                  <input className="form__input" id="homeGround" name="homeGround" placeholder="Enter location" />
                </div>
                <div className="form__group">
                  <label className="form__label" htmlFor="teamLogo">Team Logo</label>
                  <input className="form__input" id="teamLogo" name="teamLogo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
                </div>
              </div>

              <div className="tournament-form__section">
                <h2>2. Team official / manager</h2>
                <div className="form__row">
                  <div className="form__group">
                    <label className="form__label" htmlFor="officialFullName">Full Name*</label>
                    <input className="form__input" id="officialFullName" name="officialFullName" placeholder="First & Last Name" required />
                  </div>
                  <div className="form__group">
                    <label className="form__label" htmlFor="officialPhone">Phone Number*</label>
                    <input className="form__input" id="officialPhone" name="officialPhone" type="tel" placeholder="+234 XXX XXX XXXX" required />
                  </div>
                </div>
                <div className="form__row">
                  <div className="form__group">
                    <label className="form__label" htmlFor="officialWhatsapp">WhatsApp Number</label>
                    <input className="form__input" id="officialWhatsapp" name="officialWhatsapp" type="tel" placeholder="Enter WhatsApp number" />
                  </div>
                  <div className="form__group">
                    <label className="form__label" htmlFor="officialEmail">Email Address</label>
                    <input className="form__input" id="officialEmail" name="officialEmail" type="email" placeholder="Enter email" />
                    <p className="tournament-form__hint">If you add an email, the squad dashboard link is sent there.</p>
                  </div>
                </div>
                <fieldset className="tournament-form__fieldset">
                  <legend className="form__label">Position*</legend>
                  <div className="tournament-form__checks">
                    {POSITIONS.map((position) => (
                      <label key={position.value} className="tournament-form__check">
                        <input type="checkbox" name="officialPositions" value={position.value} />
                        <span>{position.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="tournament-form__section">
                <h2>3. Team details</h2>
                <div className="form__row">
                  <div className="form__group">
                    <label className="form__label" htmlFor="playerCount">Number of Players*</label>
                    <select className="form__select" id="playerCount" name="playerCount" required defaultValue="15">
                      {PLAYER_COUNTS.map((count) => (
                        <option key={count} value={count}>{count}</option>
                      ))}
                    </select>
                    <p className="tournament-form__hint">Minimum: 15. Maximum: 18.</p>
                  </div>
                  <div className="form__group">
                    <label className="form__label" htmlFor="teamCaptain">Team Captain</label>
                    <input className="form__input" id="teamCaptain" name="teamCaptain" placeholder="Full Name" />
                  </div>
                </div>
                <div className="form__row">
                  <div className="form__group">
                    <label className="form__label" htmlFor="coachName">Coach’s Name</label>
                    <input className="form__input" id="coachName" name="coachName" placeholder="Full Name" />
                  </div>
                  <div className="form__group">
                    <label className="form__label" htmlFor="assistantCoach">Assistant Coach</label>
                    <input className="form__input" id="assistantCoach" name="assistantCoach" placeholder="Full Name" />
                  </div>
                </div>
                <div className="form__row">
                  <div className="form__group">
                    <label className="form__label" htmlFor="jerseyHome">Team Jersey Colour – Home*</label>
                    <input className="form__input" id="jerseyHome" name="jerseyHome" placeholder="Select/enter colour" required />
                  </div>
                  <div className="form__group">
                    <label className="form__label" htmlFor="jerseyAway">Team Jersey Colour – Away</label>
                    <input className="form__input" id="jerseyAway" name="jerseyAway" placeholder="Select/enter colour" />
                  </div>
                </div>
              </div>

              <div className="tournament-form__section">
                <h2>4. Player registration</h2>
                <div className="tournament-form__note">
                  <p>
                    <strong>Important:</strong> A link will be sent to their email to click and add squad name and numbers. The manager will not fill players directly into this registration form.
                  </p>
                  <ol>
                    <li>Register the team</li>
                    <li>Team receives a registration dashboard/link</li>
                    <li>Manager adds players individually</li>
                    <li>Tournament committee verifies the squad</li>
                  </ol>
                </div>
              </div>

              <div className="tournament-form__section">
                <h2>5. Declaration & agreement</h2>
                <div className="tournament-form__checks">
                  <label className="tournament-form__check">
                    <input type="checkbox" name="confirmAccurate" value="true" required />
                    <span>I confirm that the information provided is accurate and complete.</span>
                  </label>
                  <label className="tournament-form__check">
                    <input type="checkbox" name="agreeRules" value="true" required />
                    <span>I agree that my team will comply with the tournament rules and regulations.</span>
                  </label>
                  <label className="tournament-form__check">
                    <input type="checkbox" name="understandVerification" value="true" required />
                    <span>I understand that the Tournament Committee reserves the right to verify submitted information and approve or reject registration based on the tournament requirements.</span>
                  </label>
                  <label className="tournament-form__check">
                    <input type="checkbox" name="consentMedia" value="true" required />
                    <span>I consent to tournament-related photographs/videos of my team being used for event publicity and documentation, subject to the tournament’s media policy.</span>
                  </label>
                </div>
                <div className="form__row">
                  <div className="form__group">
                    <label className="form__label" htmlFor="representativeName">Name of Team Representative</label>
                    <input className="form__input" id="representativeName" name="representativeName" placeholder="Full Name" required />
                  </div>
                  <div className="form__group">
                    <label className="form__label" htmlFor="digitalSignature">Digital Signature</label>
                    <input className="form__input" id="digitalSignature" name="digitalSignature" placeholder="Type Full Name" required />
                  </div>
                </div>
              </div>

              <div className="tournament-form__section">
                <h2>6. Registration fee</h2>
                <p className="tournament-form__fee">Tournament Registration Fee: {formatNaira(TOURNAMENT_FEE_NAIRA)}</p>
                {hasBankDetails ? (
                  <dl className="tournament-form__bank">
                    <div>
                      <dt>Bank</dt>
                      <dd>{bankDetails.bankName}</dd>
                    </div>
                    <div>
                      <dt>Account name</dt>
                      <dd>{bankDetails.accountName}</dd>
                    </div>
                    <div>
                      <dt>Account number</dt>
                      <dd>{bankDetails.accountNumber}</dd>
                    </div>
                    {bankDetails.paymentNote ? (
                      <div>
                        <dt>Note</dt>
                        <dd>{bankDetails.paymentNote}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : (
                  <p className="tournament-form__hint">
                    Bank transfer details have not been published yet. Contact the Tournament Committee before you transfer the fee.
                  </p>
                )}
                <label className="tournament-form__check">
                  <input type="checkbox" name="paymentMethod" value="bank_transfer" required />
                  <span>Bank Transfer</span>
                </label>
                <div className="form__group">
                  <label className="form__label" htmlFor="paymentReference">Payment Reference</label>
                  <input className="form__input" id="paymentReference" name="paymentReference" placeholder="Enter transaction/reference number" required />
                </div>
                <div className="form__group">
                  <label className="form__label" htmlFor="paymentReceipt">Upload Payment Receipt</label>
                  <input className="form__input" id="paymentReceipt" name="paymentReceipt" type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" required />
                </div>
              </div>

              <Button type="submit" full disabled={formState.loading}>
                {formState.loading ? 'Submitting...' : 'Submit Team Registration'}
              </Button>
              <p className="tournament-form__hint">
                Already registered? Open the squad link from your confirmation email, or return to the <Link href="/">homepage</Link>.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
