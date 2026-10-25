import type { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string;
  optional?: boolean;
  children: (describedBy: string | undefined) => ReactNode;
}

export function FormField({ id, label, error, hint, optional, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="form-field">
      <label htmlFor={id}>
        <span>
          {label}
          {optional ? <small> (optional)</small> : null}
        </span>
      </label>
      {children(describedBy)}
      {hint && !error ? (
        <small id={hintId} className="field-hint">
          {hint}
        </small>
      ) : null}
      {error ? (
        <small id={errorId} className="field-error" role="alert">
          {error}
        </small>
      ) : null}
    </div>
  );
}
