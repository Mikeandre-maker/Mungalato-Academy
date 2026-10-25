import type {
  ApiErrorBody,
  PilotApplicationRequest,
  PilotApplicationResponse,
  RegisterUserRequest,
  RegisterUserResponse,
} from "./types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api").replace(/\/+$/, "");

export const API_ENDPOINTS = {
  register: "/auth/register",
  pilotApplications: "/pilot/applications",
} as const;

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function fallbackMessage(status: number): string {
  if (status === 404 || status === 405 || status === 501) {
    return "This service isn't live yet. Please try again soon.";
  }
  if (status === 409) return "An account with this email already exists.";
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  return "We couldn't process your request. Check your details and try again.";
}

async function post<TResponse>(path: string, body: unknown): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = (payload ?? {}) as ApiErrorBody;
    throw new ApiError(
      errorBody.message ?? fallbackMessage(response.status),
      response.status,
      errorBody.fieldErrors ?? {},
    );
  }

  return payload as TResponse;
}

export const api = {
  registerUser: (input: RegisterUserRequest) =>
    post<RegisterUserResponse>(API_ENDPOINTS.register, input),
  submitPilotApplication: (input: PilotApplicationRequest) =>
    post<PilotApplicationResponse>(API_ENDPOINTS.pilotApplications, input),
};
