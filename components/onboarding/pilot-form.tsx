"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ApiError, api } from "@/lib/api/client";
import {
  COHORT_SIZES,
  COUNTRIES,
  ORGANISATION_TYPES,
  type CohortSize,
  type FieldErrors,
  type OrganisationType,
  type PilotApplicationRequest,
} from "@/lib/api/types";
import { hasErrors, validatePilotApplication } from "@/lib/api/validation";
import { FormField } from "./form-field";

type Status = "idle" | "submitting" | "success";

const GOALS_MAX_LENGTH = 1000;

export function PilotForm() {
  const [organisationName, setOrganisationName] = useState("");
  const [organisationType, setOrganisationType] = useState<OrganisationType>("University");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [cohortSize, setCohortSize] = useState<CohortSize>("25 – 100");
  const [goals, setGoals] = useState("");

  const [errors, setErrors] = useState<FieldErrors<PilotApplicationRequest>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmedPhone = phone.trim();
    const application: PilotApplicationRequest = {
      organisationName: organisationName.trim(),
      organisationType,
      contactName: contactName.trim(),
      email: email.trim().toLowerCase(),
      country,
      cohortSize,
      goals: goals.trim(),
      ...(trimmedPhone ? { phone: trimmedPhone } : {}),
    };

    const validationErrors = validatePilotApplication(application);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setStatus("submitting");
    try {
      await api.submitPilotApplication(application);
      setStatus("success");
    } catch (error) {
      setStatus("idle");
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors as FieldErrors<PilotApplicationRequest>);
        setFormError(error.message);
      } else {
        setFormError("Something unexpected happened. Please try again.");
      }
    }
  }

  if (status === "success") {
    return (
      <div className="form-success" role="status">
        <span className="sim-badge">APPLICATION RECEIVED</span>
        <h2>Thanks — {organisationName.trim()} is on our pilot list.</h2>
        <p className="muted">
          Our partnerships team will reach out to <strong>{email.trim()}</strong> within five
          working days to plan your cohort&apos;s onboarding.
        </p>
        <Link href="/" className="ghost-button">
          Explore the simulation
        </Link>
      </div>
    );
  }

  const isSubmitting = status === "submitting";

  return (
    <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
      <div className="panel-title">
        <div>
          <h2>Pilot application</h2>
          <p className="muted">For institutions running a founder cohort.</p>
        </div>
        <span className="pill">COHORT 2027</span>
      </div>

      {formError ? (
        <p className="error-message" role="alert">
          {formError}
        </p>
      ) : null}

      <fieldset className="form-section">
        <legend className="eyebrow">ORGANISATION</legend>

        <FormField id="organisationName" label="Organisation name" error={errors.organisationName}>
          {(describedBy) => (
            <input
              id="organisationName"
              name="organisationName"
              type="text"
              autoComplete="organization"
              value={organisationName}
              onChange={(event) => setOrganisationName(event.target.value)}
              aria-invalid={Boolean(errors.organisationName)}
              aria-describedby={describedBy}
              maxLength={160}
              required
            />
          )}
        </FormField>

        <div className="form-row">
          <FormField id="organisationType" label="Type" error={errors.organisationType}>
            {(describedBy) => (
              <select
                id="organisationType"
                name="organisationType"
                value={organisationType}
                onChange={(event) => setOrganisationType(event.target.value as OrganisationType)}
                aria-invalid={Boolean(errors.organisationType)}
                aria-describedby={describedBy}
              >
                {ORGANISATION_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField id="pilotCountry" label="Country" error={errors.country}>
            {(describedBy) => (
              <select
                id="pilotCountry"
                name="country"
                autoComplete="country-name"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                aria-invalid={Boolean(errors.country)}
                aria-describedby={describedBy}
                required
              >
                <option value="" disabled>
                  Select country
                </option>
                {COUNTRIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        </div>

        <fieldset className="form-field">
          <legend className="field-legend">Expected cohort size</legend>
          <div className="choice-grid" role="radiogroup" aria-label="Expected cohort size">
            {COHORT_SIZES.map((option) => (
              <label key={option} className={`choice-chip${cohortSize === option ? " selected" : ""}`}>
                <input
                  type="radio"
                  name="cohortSize"
                  value={option}
                  checked={cohortSize === option}
                  onChange={() => setCohortSize(option)}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
          {errors.cohortSize ? (
            <small className="field-error" role="alert">
              {errors.cohortSize}
            </small>
          ) : null}
        </fieldset>
      </fieldset>

      <fieldset className="form-section">
        <legend className="eyebrow">PRIMARY CONTACT</legend>

        <FormField id="contactName" label="Full name" error={errors.contactName}>
          {(describedBy) => (
            <input
              id="contactName"
              name="contactName"
              type="text"
              autoComplete="name"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              aria-invalid={Boolean(errors.contactName)}
              aria-describedby={describedBy}
              maxLength={120}
              required
            />
          )}
        </FormField>

        <div className="form-row">
          <FormField id="pilotEmail" label="Work email" error={errors.email}>
            {(describedBy) => (
              <input
                id="pilotEmail"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={describedBy}
                maxLength={254}
                required
              />
            )}
          </FormField>

          <FormField id="phone" label="Phone" optional error={errors.phone}>
            {(describedBy) => (
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+254 700 000 000"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={describedBy}
                maxLength={20}
              />
            )}
          </FormField>
        </div>
      </fieldset>

      <FormField
        id="goals"
        label="What do you want your cohort to get out of the pilot?"
        error={errors.goals}
        hint={`${goals.length}/${GOALS_MAX_LENGTH}`}
      >
        {(describedBy) => (
          <textarea
            id="goals"
            name="goals"
            rows={4}
            value={goals}
            onChange={(event) => setGoals(event.target.value)}
            aria-invalid={Boolean(errors.goals)}
            aria-describedby={describedBy}
            maxLength={GOALS_MAX_LENGTH}
            placeholder="e.g. Give 80 final-year students hands-on practice pitching to investors before demo day."
            required
          />
        )}
      </FormField>

      <button className="primary-button" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit pilot application"}
      </button>

      <p className="muted form-footnote">
        Just want to play? <Link href="/register">Create an individual account</Link>
      </p>
    </form>
  );
}
