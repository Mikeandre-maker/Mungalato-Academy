export const PARTICIPANT_ROLES = [
  "Founder",
  "Aspiring founder",
  "Student",
  "Educator",
  "Investor",
] as const;

export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number];

export const ORGANISATION_TYPES = [
  "University",
  "High school",
  "Incubator / accelerator",
  "Corporate",
  "NGO / foundation",
  "Government programme",
] as const;

export type OrganisationType = (typeof ORGANISATION_TYPES)[number];

export const COHORT_SIZES = ["Under 25", "25 – 100", "100 – 500", "500+"] as const;

export type CohortSize = (typeof COHORT_SIZES)[number];

export const COUNTRIES = [
  "Botswana",
  "Cameroon",
  "Côte d'Ivoire",
  "Egypt",
  "Ethiopia",
  "Ghana",
  "Kenya",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Nigeria",
  "Rwanda",
  "Senegal",
  "South Africa",
  "Tanzania",
  "Uganda",
  "Zambia",
  "Zimbabwe",
  "Other",
] as const;

export interface RegisterUserRequest {
  fullName: string;
  email: string;
  password: string;
  country: string;
  role: ParticipantRole;
  acceptedTerms: true;
}

export interface RegisterUserResponse {
  userId: string;
  email: string;
}

export interface PilotApplicationRequest {
  organisationName: string;
  organisationType: OrganisationType;
  contactName: string;
  email: string;
  phone?: string;
  country: string;
  cohortSize: CohortSize;
  goals: string;
}

export interface PilotApplicationResponse {
  applicationId: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface ApiErrorBody {
  message?: string;
  fieldErrors?: Record<string, string>;
}
