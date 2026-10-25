import Link from "next/link";
import type { ReactNode } from "react";

interface OnboardingShellProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  highlights: { title: string; body: string }[];
  children: ReactNode;
}

export function OnboardingShell({
  eyebrow,
  title,
  description,
  highlights,
  children,
}: OnboardingShellProps) {
  return (
    <div className="onboarding-shell">
      <header className="onboarding-header">
        <Link href="/" className="brand" aria-label="Venture Arena home">
          <div className="brand-mark" aria-hidden="true">
            VA
          </div>
          <div>
            <strong>VENTURE ARENA</strong>
            <span>BUILD. SURVIVE. PITCH. RISE.</span>
          </div>
        </Link>
        <nav aria-label="Onboarding" className="onboarding-nav">
          <Link href="/register">Create account</Link>
          <Link href="/pilot">Run a pilot</Link>
        </nav>
      </header>

      <main className="onboarding-main">
        <section className="onboarding-intro" aria-labelledby="onboarding-title">
          <span className="eyebrow">{eyebrow}</span>
          <h1 id="onboarding-title">{title}</h1>
          <p>{description}</p>
          <ul className="onboarding-highlights">
            {highlights.map((item, index) => (
              <li key={item.title}>
                <span className="mission-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel onboarding-card">{children}</section>
      </main>
    </div>
  );
}
