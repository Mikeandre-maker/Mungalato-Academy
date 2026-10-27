"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = { id: string; email: string; fullName: string; country: string; role: string; createdAt: string };
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then(async r => { const d = await r.json().catch(()=>({})); if (!r.ok) throw new Error(d.message || "Please sign in."); return d.user as Profile; })
      .then(p => { if (active) setProfile(p); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "Please sign in."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function logout() { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); router.replace("/login"); router.refresh(); }
  return <main className="onboarding-shell"><header className="onboarding-header"><Link href="/" className="brand"><div className="brand-mark">VA</div><div><strong>VENTURE ARENA</strong><span>BUILD. SURVIVE. PITCH. RISE.</span></div></Link><nav className="onboarding-nav"><Link href="/">Command Centre</Link><button className="ghost-button" onClick={logout}>Log out</button></nav></header><section className="panel onboarding-card" style={{maxWidth:720,margin:"48px auto",padding:28}}><span className="eyebrow">FOUNDER PROFILE</span><h1 style={{margin:"12px 0 8px"}}>{loading ? "Loading your profile…" : profile?.fullName || "Your account"}</h1>{error ? <p className="error-message" role="alert">{error} <Link href="/login">Log in</Link></p> : null}{profile ? <><p className="muted">Your verified account details.</p><div className="decision-preview" style={{marginTop:24}}><div><span>Email</span><strong>{profile.email}</strong></div><div><span>Country</span><strong>{profile.country || "Not provided"}</strong></div><div><span>Participant type</span><strong>{profile.role}</strong></div><div><span>Member since</span><strong>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</strong></div></div><div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:24}}><Link href="/" className="primary-button">Enter Venture Arena →</Link><button className="ghost-button" onClick={logout}>Log out</button></div></> : null}</section></main>;
}
