import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="onboarding-shell">
      <header className="onboarding-header">
        <Link href="/welcome" className="brand">
          <div className="brand-mark">VA</div>
          <div><strong>VENTURE ARENA</strong><span>BUILD. SURVIVE. PITCH. RISE.</span></div>
        </Link>
      </header>
      <section className="panel onboarding-card" style={{maxWidth:760, margin:"48px auto", padding:32}}>
        <span className="eyebrow">YOUR ENTREPRENEURSHIP JOURNEY STARTS HERE</span>
        <h1 style={{fontSize:"clamp(2rem, 5vw, 3.5rem)", lineHeight:1.08, margin:"16px 0"}}>Build your venture. <em>Face the Den.</em></h1>
        <p className="muted" style={{fontSize:17, lineHeight:1.7}}>Practice real business decisions, sharpen your pitch, and test your ideas against AI investor judges in a safe simulation built for ambitious founders.</p>
        <div className="decision-preview" style={{margin:"24px 0"}}>
          <div><span>01</span><strong>Build a business</strong></div>
          <div><span>02</span><strong>Make decisions</strong></div>
          <div><span>03</span><strong>Pitch the judges</strong></div>
        </div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:24}}>
          <Link href="/register" className="primary-button">Create free account <span aria-hidden="true">→</span></Link>
          <Link href="/login" className="ghost-button">Log in to your account</Link>
        </div>
        <p className="muted" style={{marginTop:22,fontSize:13}}>Your account keeps your profile private. Sign in to access your founder workspace.</p>
      </section>
    </main>
  );
}
