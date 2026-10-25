import {
  COHORT_SIZES,
  ORGANISATION_TYPES,
  PARTICIPANT_ROLES,
  type FieldErrors,
  type PilotApplicationRequest,
  type RegisterUserRequest,
} from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9\s()-]{7,20}$/;

export const PASSWORD_MIN_LENGTH = 8;

export function validateRegistration(
  input: Omit<RegisterUserRequest, "acceptedTerms"> & { acceptedTerms: boolean },
): FieldErrors<RegisterUserRequest> {
  const errors: FieldErrors<RegisterUserRequest> = {};

  if (input.fullName.trim().length < 2) errors.fullName = "Enter your full name.";
  if (!EMAIL_PATTERN.test(input.email.trim())) errors.email = "Enter a valid email address.";
  if (input.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  } else if (!/[A-Za-z]/.test(input.password) || !/[0-9]/.test(input.password)) {
    errors.password = "Include at least one letter and one number.";
  }
  if (!input.country) errors.country = "Select your country.";
  if (!PARTICIPANT_ROLES.includes(input.role)) errors.role = "Select how you'll use Venture Arena.";
  if (!input.acceptedTerms) errors.acceptedTerms = "You need to accept the terms to continue.";

  return errors;
}

export function validatePilotApplication(
  input: PilotApplicationRequest,
): FieldErrors<PilotApplicationRequest> {
  const errors: FieldErrors<PilotApplicationRequest> = {};

  if (input.organisationName.trim().length < 2) {
    errors.organisationName = "Enter your organisation's name.";
  }
  if (!ORGANISATION_TYPES.includes(input.organisationType)) {
    errors.organisationType = "Select an organisation type.";
  }
  if (input.contactName.trim().length < 2) errors.contactName = "Enter a contact name.";
  if (!EMAIL_PATTERN.test(input.email.trim())) errors.email = "Enter a valid email address.";
  if (input.phone && !PHONE_PATTERN.test(input.phone.trim())) {
    errors.phone = "Enter a valid phone number, including country code.";
  }
  if (!input.country) errors.country = "Select your country.";
  if (!COHORT_SIZES.includes(input.cohortSize)) errors.cohortSize = "Select a cohort size.";
  if (input.goals.trim().length < 20) {
    errors.goals = "Tell us a little more (at least 20 characters).";
  }

  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
