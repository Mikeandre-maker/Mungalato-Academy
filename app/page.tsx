"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Judge = { id: string; name: string; role: string; focus: string; initials: string; tone: string };
type Message = { role: "judge" | "founder"; text: string };
const judges: Judge[] = [
  { id: "shark", name: "The Shark", role: "Lead Investor", focus: "investment discipline, differentiation and capital allocation", initials: "SH", tone: "Direct, skeptical and commercially focused." },
  { id: "cfo", name: "The CFO", role: "Financial Strategist", focus: "cash flow, margins, break-even and unit economics", initials: "CF", tone: "Precise, numbers-first and intolerant of financial contradictions." },
  { id: "market", name: "The Market Hawk", role: "Market Strategist", focus: "customer demand, competition and route to market", initials: "MH", tone: "Curious, challenging and evidence-driven." },
  { id: "operator", name: "The Operator", role: "Execution Expert", focus: "operations, supply chain, hiring and delivery risks", initials: "OP", tone: "Practical, focused on execution and contingency plans." },
  { id: "impact", name: "The Impact Investor", role: "Impact & Sustainability", focus: "measurable impact, resilience and commercial sustainability", initials: "II", tone: "Mission-minded but expects a sustainable business." }
];

const money = (n: number) => new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW", maximumFractionDigits: 0 }).format(n);
const firstQuestion = "You want me to back this business, but I see an idea—not yet a proven company. What customer problem are you solving, who will pay you, and what evidence do you have that they will?";

export default function Home() {
  const [tab, setTab] = useState<"overview" | "business" | "den" | "scorecard">("overview");
  const [ventureName, setVentureName] = useState("FreshRoute Foods");
  const [problem, setProblem] = useState("Small retailers struggle to source fresh produce reliably at predictable prices.");
  const [customer, setCustomer] = useState("Market vendors and small food retailers");
  const [solution, setSolution] = useState("Aggregate produce from local farmers and deliver in scheduled orders.");
  const [cash, setCash] = useState(20000);
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [period, setPeriod] = useState(1);
  const [event, setEvent] = useState("Your first trading week is ready. Choose how to use your capital.");
  const [price, setPrice] = useState(120);
  const [stock, setStock] = useState(80);
  const [marketing, setMarketing] = useState(500);
  const [delivery, setDelivery] = useState(350);
  const [credit, setCredit] = useState(false);
  const [judgeId, setJudgeId] = useState("shark");
  const [pitch, setPitch] = useState("");
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "judge", text: firstQuestion }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [readiness, setReadiness] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [played, setPlayed] = useState(false);

  const judge = judges.find(j => j.id === judgeId) ?? judges[0] ?? {
    id: "shark",
    name: "The Shark",
    role: "Lead Investor",
    focus: "investment discipline, differentiation and capital allocation",
    initials: "SH",
    tone: "Direct, skeptical and commercially focused.",
  };
  const profit = revenue - expenses;
  const runway = expenses > 0 ? Math.max(0, Math.floor(cash / expenses)) : 0;
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
  const progress = Math.min(100, Math.round(((period - 1) / 5) * 100));
  const profile = useMemo(() => ({
    name: ventureName, problem, customer, solution,
    industry: "Food distribution / agribusiness",
    stage: period > 3 ? "Early traction (simulated)" : "Idea / validation (simulated)",
    financials: { startingCapital: 20000, cash, revenue, expenses, profit, customers, period, price, stock, marketing, delivery, credit },
  }), [ventureName, problem, customer, solution, cash, revenue, expenses, profit, customers, period, price, stock, marketing, delivery, credit]);

  function runPeriod() {
    const stockCost = stock * 65;
    const demand = Math.max(0, Math.round(26 + marketing / 90 + (price <= 115 ? 10 : price <= 130 ? 0 : -12) + (period > 1 ? 5 : 0)));
    const unitsSold = Math.min(stock, demand);
    const sales = unitsSold * price;
    const operatingCosts = stockCost + marketing + delivery + 250;
    const nextProfit = sales - operatingCosts;
    const creditDelay = credit ? Math.round(sales * 0.25) : 0;
    const cashChange = sales - creditDelay - operatingCosts;
    const nextCash = cash + cashChange;
    setRevenue(v => v + sales);
    setExpenses(v => v + operatingCosts);
    setCash(nextCash);
    setCustomers(v => v + Math.max(1, Math.round(unitsSold / 5)));
    setPeriod(v => v + 1);
    setPlayed(true);
    const outcomes = [
      `Period ${period} complete: ${unitsSold} units sold from ${stock} stocked. Sales ${money(sales)}; operating costs ${money(operatingCosts)}; period result ${money(nextProfit)}.`,
      credit ? `You offered customer credit. ${money(creditDelay)} is still outstanding, so revenue does not all become cash today.` : "You collected sales immediately, protecting working capital.",
      nextCash < 0 ? "WARNING: your cash position is negative. The business needs a credible turnaround plan." :
      nextProfit < 0 ? "Your operating result is negative. Revisit price, stock levels or costs before scaling." :
      "Your period result is positive. Check whether the result is repeatable before increasing spending."
    ];
    if (stock > demand * 1.5) outcomes.push("Inventory risk: you bought substantially more stock than simulated demand. Consider spoilage and tied-up cash.");
    if (price > 140) outcomes.push("Pricing risk: the higher price reduced estimated demand in this simplified model.");
    setEvent(outcomes.join(" "));
    setTab("business");
  }

  function resetSimulation() {
    setCash(20000); setRevenue(0); setExpenses(0); setCustomers(0); setPeriod(1);
    setEvent("New simulation started with ZMW 20,000 in fictional capital.");
    setPlayed(false); setReadiness(null); setFeedback("");
  }

  async function askJudge() {
    if (!answer.trim()) return;
    setError(""); setLoading(true);
    const userAnswer = answer.trim();
    const nextMessages: Message[] = [...messages, { role: "founder", text: userAnswer }];
    setMessages(nextMessages);
    setAnswer("");
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judge: { name: judge.name, role: judge.role, focus: judge.focus, tone: judge.tone },
          startup: profile,
          pitch: pitch || `${ventureName}: ${solution} For ${customer}. Problem: ${problem}`,
          history: nextMessages.slice(-8),
          answer: userAnswer,
          round
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The judge could not respond. Please try again.");
      setMessages(prev => [...prev, { role: "judge", text: data.reply }]);
      if (typeof data.score === "number") setReadiness(data.score);
      if (data.feedback) setFeedback(data.feedback);
      setRound(v => v + 1);
      setTab("den");
    } catch (e) {
      setMessages(prev => prev.filter((m, i) => !(m.role === "founder" && i === prev.length - 1)));
      setError(e instanceof Error ? e.message : "Unexpected error. Check your connection and try again.");
    } finally { setLoading(false); }
  }

  async function evaluatePitch() {
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "evaluate",
          judge: { name: judge.name, role: judge.role, focus: judge.focus, tone: judge.tone },
          startup: profile,
          pitch: pitch || `${ventureName}: ${solution} For ${customer}. Problem: ${problem}`,
          history: messages.slice(-8),
          answer: "Provide a concise scorecard for the founder's current pitch and conversation.",
          round
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not evaluate this pitch.");
      setFeedback(data.feedback || data.reply);
      if (typeof data.score === "number") setReadiness(data.score);
      setTab("scorecard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">VA</div><div><strong>VENTURE ARENA</strong><span>FOUNDER TRAINING GROUND</span></div></div>
        <div className="profile-chip"><div className="avatar">F</div><div><strong>Founder in Training</strong><span>Level 01 · The Dreamer</span></div></div>
        <p className="nav-label">YOUR ARENA</p>
        <nav>
          {[
            ["overview", "◈", "Command Centre"],
            ["business", "▦", "Business Lab"],
            ["den", "⚖", "Investment Den"],
            ["scorecard", "▤", "Judge's Scorecard"]
          ].map(([id, icon, label]) => <button key={id} className={`nav-item ${tab === id ? "active" : ""}`} onClick={() => setTab(id as typeof tab)}><span>{icon}</span>{label}</button>)}
        </nav>
        <div className="sidebar-bottom"><div className="live-dot"/> <span>SIMULATION MODE</span><p>Virtual money only. No real investment is offered.</p></div>
      </aside>

      <section className="main-area">
        <header className="topbar"><div><span className="eyebrow">FOUNDER JOURNEY / LEVEL 01</span><h1>{tab === "overview" ? "Command Centre" : tab === "business" ? "Business Lab" : tab === "den" ? "The Investment Den" : "Judge's Scorecard"}</h1></div><div className="topbar-actions"><Link href="/register" className="ghost-button">Create account ↗</Link><button className="ghost-button" onClick={resetSimulation}>↻ Reset simulation</button></div></header>

        {tab === "overview" && <>
          <section className="hero-card">
            <div className="hero-copy"><span className="pill">YOUR JOURNEY STARTS HERE</span><h2>Build something<br/><em>worth backing.</em></h2><p>Make decisions. Survive the numbers. Face the judges. Learn before you risk real capital.</p><button className="primary-button" onClick={() => setTab("business")}>Enter the Business Lab <span>→</span></button></div>
            <div className="hero-emblem"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="emblem-core"><span>VA</span><small>FOUNDER<br/>READINESS</small></div><div className="emblem-star">✦</div></div>
          </section>
          <div className="section-heading"><div><span className="eyebrow">YOUR VENTURE</span><h2>Build your business profile</h2></div><span className="subtle-tag">DRAFT PROFILE</span></div>
          <div className="panel profile-form">
            <label>Business name<input value={ventureName} onChange={e => setVentureName(e.target.value)} maxLength={80}/></label>
            <label>Customer problem<textarea value={problem} onChange={e => setProblem(e.target.value)} rows={3} maxLength={700}/></label>
            <label>Target customers<input value={customer} onChange={e => setCustomer(e.target.value)} maxLength={180}/></label>
            <label>Your solution<textarea value={solution} onChange={e => setSolution(e.target.value)} rows={3} maxLength={700}/></label>
            <button className="primary-button" onClick={() => setTab("den")}>Take this venture to the Den <span>→</span></button>
          </div>
          <div className="section-heading"><div><span className="eyebrow">YOUR FIRST MISSION</span><h2>Three steps to your first pitch</h2></div></div>
          <div className="mission-grid"><div className="mission-card"><span className="mission-number">01</span><h3>Run your business</h3><p>Make your first set of operating decisions and see the numbers move.</p><span className="mission-status">{played ? "✓ COMPLETED" : "○ NOT STARTED"}</span></div><div className="mission-card"><span className="mission-number">02</span><h3>Defend your idea</h3><p>Face a tough AI judge who asks questions based on your business.</p><span className="mission-status">{round > 1 ? "✓ IN PROGRESS" : "○ NOT STARTED"}</span></div><div className="mission-card"><span className="mission-number">03</span><h3>Improve your score</h3><p>Review feedback and return with better evidence and reasoning.</p><span className="mission-status">{readiness !== null ? "✓ SCORE EARNED" : "○ NOT STARTED"}</span></div></div>
        </>}

        {tab === "business" && <>
          <div className="intro-row"><div><span className="eyebrow">SCENARIO 01 / AGRIBUSINESS</span><h2>FreshRoute Foods</h2><p>Aggregate fresh produce from farmers and deliver to small retailers.</p></div><span className="pill">PERIOD {period} / 6</span></div>
          <div className="metric-grid"><Metric label="Cash balance" value={money(cash)} hint={cash < 0 ? "Critical: negative cash" : "Available virtual cash"} danger={cash < 0}/><Metric label="Cumulative revenue" value={money(revenue)} hint="Sales across periods"/><Metric label="Operating result" value={money(profit)} hint="Revenue less operating costs" danger={profit < 0}/><Metric label="Customers reached" value={String(customers)} hint="Estimated cumulative customers"/></div>
          <div className="panel"><div className="panel-title"><div><span className="eyebrow">DECISION ROUND</span><h3>Allocate your resources</h3></div><span className="subtle-tag">ZMW · SIMULATED</span></div>
            <div className="control-grid">
              <label>Selling price per unit <strong>{money(price)}</strong><input type="range" min="80" max="180" step="5" value={price} onChange={e => setPrice(Number(e.target.value))}/><small>Higher prices can reduce demand.</small></label>
              <label>Stock to purchase <strong>{stock} units</strong><input type="range" min="20" max="200" step="10" value={stock} onChange={e => setStock(Number(e.target.value))}/><small>Purchase cost: {money(stock * 65)}</small></label>
              <label>Marketing budget <strong>{money(marketing)}</strong><input type="range" min="0" max="2500" step="100" value={marketing} onChange={e => setMarketing(Number(e.target.value))}/><small>Can increase estimated demand.</small></label>
              <label>Delivery cost <strong>{money(delivery)}</strong><input type="range" min="100" max="1500" step="50" value={delivery} onChange={e => setDelivery(Number(e.target.value))}/><small>Lower costs may constrain service.</small></label>
            </div>
            <label className="check-row"><input type="checkbox" checked={credit} onChange={e => setCredit(e.target.checked)}/><span><strong>Offer customer credit</strong><small>Potentially attract customers, but delay 25% of sales cash in this simplified scenario.</small></span></label>
            <div className="decision-preview"><div><span>Stock cost</span><strong>{money(stock * 65)}</strong></div><div><span>Planned operating spend</span><strong>{money(stock * 65 + marketing + delivery + 250)}</strong></div><div><span>Cash before sales</span><strong className={cash - stock * 65 - marketing - delivery - 250 < 0 ? "negative" : ""}>{money(cash - stock * 65 - marketing - delivery - 250)}</strong></div></div>
            <button className="primary-button" onClick={runPeriod} disabled={period > 6 || cash < 0}>Commit decisions & run period <span>→</span></button>
            {period > 6 && <p className="notice">You&apos;ve completed the six-period demo. Reset the simulation to play again.</p>}
          </div>
          <div className="panel outcome-panel"><div className="panel-title"><h3>Market intelligence</h3><span className="subtle-tag">LATEST OUTCOME</span></div><p>{event}</p><div className="progress-track"><div style={{width: `${progress}%`}}/></div><small>Simulation progress · {Math.min(period - 1, 6)} of 6 periods complete</small></div>
        </>}

        {tab === "den" && <>
          <div className="den-banner"><div><span className="eyebrow">LIVE SIMULATION / ROUND {round}</span><h2>Welcome to the Den.</h2><p>Every claim is an invitation to ask for evidence.</p></div><div className="den-symbol">⚖</div></div>
          <div className="judge-layout"><div className="judge-list panel"><span className="eyebrow">CHOOSE YOUR CHALLENGER</span>{judges.map(j => <button key={j.id} className={`judge-option ${j.id === judgeId ? "selected" : ""}`} onClick={() => {setJudgeId(j.id);setMessages([{role:"judge",text:`I am ${j.name}. My focus is ${j.focus}. ${firstQuestion}`}]);setRound(1);setError("");}}><div className="judge-avatar">{j.initials}</div><div><strong>{j.name}</strong><span>{j.role}</span></div><span className="chevron">›</span></button>)}</div>
            <div className="panel chat-panel"><div className="chat-header"><div className="judge-avatar large">{judge.initials}</div><div><h3>{judge.name}</h3><span>{judge.role} · {judge.focus}</span></div><span className="live-tag"><i/> AI JUDGE</span></div>
              <div className="chat-messages">{messages.map((m,i) => <div key={i} className={`message ${m.role}`}><span className="message-author">{m.role === "judge" ? judge.name.toUpperCase() : "YOU · FOUNDER"}</span><p>{m.text}</p></div>)}{loading && <div className="message judge"><span className="message-author">JUDGE IS THINKING</span><p className="typing">Reviewing your answer<span>.</span><span>.</span><span>.</span></p></div>}</div>
              <div className="pitch-fields"><label>Pitch summary (optional)<textarea value={pitch} onChange={e => setPitch(e.target.value)} rows={2} maxLength={2500} placeholder="Describe the problem, solution, customers, traction and funding ask..."/></label><label>Your answer<textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={3} maxLength={2500} placeholder="Defend your decision with evidence, assumptions or numbers..." onKeyDown={e => {if(e.key === "Enter" && !e.shiftKey){e.preventDefault();void askJudge();}}}/></label><div className="chat-actions"><span>Enter to send · Shift + Enter for a new line</span><button className="primary-button" onClick={() => void askJudge()} disabled={loading || !answer.trim()}>Answer judge ↑</button></div>{error && <p className="error-text">{error}</p>}<button className="text-button" onClick={() => void evaluatePitch()} disabled={loading}>Generate full scorecard ↗</button></div>
            </div>
          </div>
          <div className="disclaimer">AI feedback is for practice and education. It is not an investment recommendation or a guarantee of funding.</div>
        </>}

        {tab === "scorecard" && <>
          <div className="intro-row"><div><span className="eyebrow">PERFORMANCE REVIEW</span><h2>Your Founder Scorecard</h2><p>Use feedback to strengthen your next attempt.</p></div><button className="ghost-button" onClick={() => setTab("den")}>← Return to Den</button></div>
          <div className="score-hero panel"><div className="score-ring"><strong>{readiness ?? "—"}</strong><span>/ 100</span></div><div><span className="eyebrow">CURRENT READINESS ESTIMATE</span><h3>{readiness === null ? "Complete an assessment" : readiness >= 80 ? "Promising performance" : readiness >= 60 ? "Developing founder" : "Back to the business lab"}</h3><p>{readiness === null ? "Answer a few judge questions, then request your scorecard." : "This AI-generated practice score is indicative, not a validated predictor of investment success."}</p></div></div>
          <div className="panel"><div className="panel-title"><h3>Judge feedback</h3><span className="subtle-tag">LATEST ASSESSMENT</span></div>{feedback ? <div className="feedback-content">{feedback}</div> : <p className="muted">Your feedback will appear here after you request a scorecard from the Investment Den.</p>}<button className="primary-button" onClick={() => setTab("den")}>Return to the Investment Den <span>→</span></button></div>
          <div className="panel"><h3>Competencies to develop</h3><div className="competency-list">{["Customer validation","Business model clarity","Financial literacy","Operational readiness","Pitch communication","Evidence and objection handling"].map((x,i) => <div key={x}><span>{x}</span><span className="competency-track"><i style={{width: `${readiness === null ? 12 : Math.max(18, Math.min(92, readiness - i * 4 + 12))}%`}}/></span></div>)}</div><small className="muted">Competency bars are illustrative until the full rubric assessment is returned.</small></div>
        </>}
        <footer><span>VENTURE ARENA © 2026</span><span>BUILD. SURVIVE. PITCH. RISE.</span><span>Prototype · No real money involved</span></footer>
      </section>
    </main>
  );
}

function Metric({label, value, hint, danger = false}: {label:string; value:string; hint:string; danger?:boolean}) {
  return <div className="metric-card"><span>{label}</span><strong className={danger ? "negative" : ""}>{value}</strong><small>{hint}</small></div>;
}