"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ApiError, api } from "@/lib/api/client";
import {
  COUNTRIES,
  PARTICIPANT_ROLES,
  type FieldErrors,
  type ParticipantRole,
  type RegisterUserRequest,
} from "@/lib/api/types";
import { PASSWORD_MIN_LENGTH, hasErrors, validateRegistration } from "@/lib/api/validation";
import { FormField } from "./form-field";

type Status = "idle" | "submitting" | "success";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState("");
  const [role, setRole] = useState<ParticipantRole>("Founder");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState<FieldErrors<RegisterUserRequest>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const draft = { fullName, email, password, country, role, acceptedTerms };
    const validationErrors = validateRegistration(draft);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setStatus("submitting");
    try {
      await api.registerUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        country,
        role,
        acceptedTerms: true,
      });
      setStatus("success");
    } catch (error) {
      setStatus("idle");
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors as FieldErrors<RegisterUserRequest>);
        setFormError(error.message);
      } else {
        setFormError("Something unexpected happened. Please try again.");
      }
    }
  }

  if (status === "success") {
    return (
      <div className="form-success" role="status">
        <span className="sim-badge">ACCOUNT CREATED</span>
        <h2>Welcome to the Arena, {fullName.trim().split(" ")[0]}.</h2>
        <p className="muted">
          We&apos;ve sent a confirmation link to <strong>{email.trim()}</strong>. Verify your email,
          then start building your first venture.
        </p>
        <Link href="/login" className="primary-button">
          Log in to continue <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  const isSubmitting = status === "submitting";

  return (
    <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
      <div className="panel-title">
        <div>
          <h2>Create your founder account</h2>
          <p className="muted">Free while we&apos;re in pilot.</p>
        </div>
        <span className="pill">STEP 1 OF 1</span>
      </div>

      {formError ? (
        <div className="error-message" role="alert">
          <p>{formError}</p>
          {/confirmation emails|email rate limit|account may already exist/i.test(formError) ? (
            <p>
              Already registered or confirmed? <Link href="/login">Go to login</Link>. Do not create another account.
            </p>
          ) : null}
        </div>
      ) : null}

      <FormField id="fullName" label="Full name" error={errors.fullName}>
        {(describedBy) => (
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={describedBy}
            maxLength={120}
            required
          />
        )}
      </FormField>

      <FormField id="email" label="Email" error={errors.email}>
        {(describedBy) => (
          <input
            id="email"
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

      <FormField
        id="password"
        label="Password"
        error={errors.password}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters, with a letter and a number.`}
      >
        {(describedBy) => (
          <div className="password-row">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={describedBy}
              maxLength={128}
              required
            />
            <button
              type="button"
              className="ghost-button"
              onClick={() => setShowPassword((value) => !value)}
              aria-pressed={showPassword}
              aria-controls="password"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        )}
      </FormField>

      <div className="form-row">
        <FormField id="country" label="Country" error={errors.country}>
          {(describedBy) => (
            <select
              id="country"
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

        <FormField id="role" label="I am a" error={errors.role}>
          {(describedBy) => (
            <select
              id="role"
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value as ParticipantRole)}
              aria-invalid={Boolean(errors.role)}
              aria-describedby={describedBy}
            >
              {PARTICIPANT_ROLES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      <div className="form-field">
        <label className="check-row" htmlFor="acceptedTerms">
          <input
            id="acceptedTerms"
            name="acceptedTerms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            aria-invalid={Boolean(errors.acceptedTerms)}
            aria-describedby={errors.acceptedTerms ? "acceptedTerms-error" : undefined}
          />
          <span>
            I agree to the Terms of Use and Privacy Policy
            <small>Venture Arena is a simulation. Nothing here is financial advice.</small>
          </span>
        </label>
        {errors.acceptedTerms ? (
          <small id="acceptedTerms-error" className="field-error" role="alert">
            {errors.acceptedTerms}
          </small>
        ) : null}
      </div>

      <button className="primary-button" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>

      <p className="muted form-footnote">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
      <p className="muted form-footnote">
        Bringing a whole cohort? <Link href="/pilot">Apply for an institutional pilot</Link>
      </p>
    </form>
  );
}
