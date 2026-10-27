"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email, password }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not sign in.");
      router.push("/profile"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Sign-in failed. Please try again."); }
    finally { setBusy(false); }
  }

  return <OnboardingShell eyebrow="WELCOME BACK" title={<>Your next move starts <em>here.</em></>} description="Sign in to return to your founder journey, your venture profile, and the Investment Den." highlights={[
    { title: "Your founder profile", body: "Access the details attached to your account." },
    { title: "Continue building", body: "Return to your business simulation and decisions." },
    { title: "Challenge the judges", body: "Practice answering investor questions and receive feedback." },
  ]}>
    <form className="onboarding-form" onSubmit={submit}>
      <div className="panel-title"><div><h2>Log in to Venture Arena</h2><p className="muted">Use the email and password you registered with.</p></div></div>
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      <div className="form-field"><label htmlFor="login-email">Email</label><input id="login-email" name="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
      <div className="form-field"><label htmlFor="login-password">Password</label><div className="password-row"><input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /><button type="button" className="ghost-button" onClick={()=>setShowPassword(v=>!v)}>{showPassword ? "Hide" : "Show"}</button></div></div>
      <button className="primary-button" type="submit" disabled={busy}>{busy ? "Signing in…" : "Log in"} <span aria-hidden="true">→</span></button>
      <p className="muted form-footnote">New to the Arena? <Link href="/register">Create an account</Link></p>
      <p className="muted form-footnote"><Link href="/">Return to the simulation</Link></p>
    </form>
  </OnboardingShell>;
}
