"use client";

import { useMemo, useState } from "react";

type Tab = "overview" | "business" | "den" | "scorecard";

type Judge = {
  id: string;
  name: string;
  role: string;
  focus: string;
  initials: string;
  tone: string;
};

type Message = { role: "judge" | "founder"; text: string };

type PeriodOutcome = {
  stockCost: number;
  demand: number;
  unitsSold: number;
  sales: number;
  operatingCosts: number;
  nextProfit: number;
  creditDelay: number;
  nextCash: number;
  customerIncrement: number;
};

const judges: Judge[] = [
  {
    id: "shark",
    name: "The Shark",
    role: "Lead Investor",
    focus: "investment discipline, differentiation and capital allocation",
    initials: "SH",
    tone: "Direct, skeptical and commercially focused.",
  },
  {
    id: "cfo",
    name: "The CFO",
    role: "Financial Strategist",
    focus: "cash flow, margins, break-even and unit economics",
    initials: "CF",
    tone: "Precise, numbers-first and intolerant of financial confusion.",
  },
  {
    id: "market",
    name: "The Market Hawk",
    role: "Market Strategist",
    focus: "customer demand, competition and route to market",
    initials: "MH",
    tone: "Curious, challenging and evidence-driven.",
  },
  {
    id: "operator",
    name: "The Operator",
    role: "Execution Expert",
    focus: "operations, supply chain, hiring and delivery risks",
    initials: "OP",
    tone: "Practical, focused on execution and contingency planning.",
  },
  {
    id: "impact",
    name: "The Impact Investor",
    role: "Impact & Sustainability",
    focus: "measurable impact, resilience and commercial sustainability",
    initials: "II",
    tone: "Mission-minded but expects evidence, discipline and accountability.",
  },
];

const firstQuestion =
  "You want me to back this business, but I see an idea—not yet a proven company. What customer problem are you solving, who will pay you, and what evidence do you have that they will buy again?";

const money = (value: number) =>
  new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    maximumFractionDigits: 0,
  }).format(value);

function buildPitchText({
  ventureName,
  solution,
  customer,
  problem,
}: {
  ventureName: string;
  solution: string;
  customer: string;
  problem: string;
}) {
  return `${ventureName}: ${solution} For ${customer}. Problem: ${problem}`;
}

function computePeriodOutcome({
  cash,
  stock,
  price,
  marketing,
  delivery,
  credit,
  period,
}: {
  cash: number;
  stock: number;
  price: number;
  marketing: number;
  delivery: number;
  credit: boolean;
  period: number;
}): PeriodOutcome {
  const stockCost = stock * 65;
  const demand = Math.max(
    0,
    Math.round(
      26 +
        marketing / 90 +
        (price <= 115 ? 10 : price <= 130 ? 0 : -12) +
        (period > 1 ? 5 : 0),
    ),
  );

  const unitsSold = Math.min(stock, demand);
  const sales = unitsSold * price;
  const operatingCosts = stockCost + marketing + delivery + 250;
  const nextProfit = sales - operatingCosts;
  const creditDelay = credit ? Math.round(sales * 0.25) : 0;
  const cashChange = sales - creditDelay - operatingCosts;
  const nextCash = cash + cashChange;

  return {
    stockCost,
    demand,
    unitsSold,
    sales,
    operatingCosts,
    nextProfit,
    creditDelay,
    nextCash,
    customerIncrement: Math.max(1, Math.round(unitsSold / 5)),
  };
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("overview");
  const [ventureName, setVentureName] = useState("FreshRoute Foods");
  const [problem, setProblem] = useState(
    "Small retailers struggle to source fresh produce reliably at predictable prices.",
  );
  const [customer, setCustomer] = useState("Market vendors and small food retailers");
  const [solution, setSolution] = useState(
    "Aggregate produce from local farmers and deliver in scheduled orders.",
  );
  const [cash, setCash] = useState(20000);
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [period, setPeriod] = useState(1);
  const [event, setEvent] = useState(
    "Your first trading week is ready. Choose how to use your capital.",
  );
  const [price, setPrice] = useState(120);
  const [stock, setStock] = useState(80);
  const [marketing, setMarketing] = useState(500);
  const [delivery, setDelivery] = useState(350);
  const [credit, setCredit] = useState(false);
  const [judgeId, setJudgeId] = useState("shark");
  const [pitch, setPitch] = useState("");
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "judge", text: firstQuestion },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [readiness, setReadiness] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [played, setPlayed] = useState(false);

  const judge = useMemo<Judge>(
    () => judges.find((item) => item.id === judgeId) ?? (judges[0] as Judge),
    [judgeId],
  );

  const profit = revenue - expenses;
  const runway = expenses > 0 ? Math.max(0, Math.floor(cash / expenses)) : 0;
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
  const progress = Math.min(100, Math.round(((period - 1) / 5) * 100));

  const profile = useMemo(
    () => ({
      name: ventureName,
      problem,
      customer,
      solution,
      industry: "Food distribution / agribusiness",
      stage: period > 3 ? "Early traction (simulated)" : "Idea / validation (simulated)",
      financials: {
        startingCapital: 20000,
        cash,
        revenue,
        expenses,
        profit,
        customers,
        period,
        price,
        stock,
        marketing,
        delivery,
        credit,
      },
    }),
    [ventureName, problem, customer, solution, cash, revenue, expenses, profit, customers, period, price, stock, marketing, delivery, credit],
  );

  function resetSimulation() {
    setCash(20000);
    setRevenue(0);
    setExpenses(0);
    setCustomers(0);
    setPeriod(1);
    setEvent("New simulation started with ZMW 20,000 in fictional capital.");
    setPlayed(false);
    setReadiness(null);
    setFeedback("");
    setMessages([{ role: "judge", text: firstQuestion }]);
    setPitch("");
    setAnswer("");
    setRound(1);
    setError("");
    setJudgeId("shark");
  }

  function runPeriod() {
    if (period > 6 || cash < 0) return;

    const outcome = computePeriodOutcome({
      cash,
      stock,
      price,
      marketing,
      delivery,
      credit,
      period,
    });

    setRevenue((value) => value + outcome.sales);
    setExpenses((value) => value + outcome.operatingCosts);
    setCash(outcome.nextCash);
    setCustomers((value) => value + outcome.customerIncrement);
    setPeriod((value) => value + 1);
    setPlayed(true);

    const outcomes = [
      `Period ${period} complete: ${outcome.unitsSold} units sold from ${stock} stocked. Sales ${money(outcome.sales)}; operating costs ${money(outcome.operatingCosts)}; period result ${money(outcome.nextProfit)}.`,
      credit
        ? `You offered customer credit. ${money(outcome.creditDelay)} is still outstanding, so revenue does not all become cash today.`
        : "You collected sales immediately, protecting working capital.",
      outcome.nextCash < 0
        ? "WARNING: your cash position is negative. The business needs a credible turnaround plan."
        : outcome.nextProfit < 0
          ? "Your operating result is negative. Revisit price, stock levels or costs before scaling."
          : "Your period result is positive. Check whether the result is repeatable before increasing spending.",
    ];

    if (stock > outcome.demand * 1.5) {
      outcomes.push(
        "Inventory risk: you bought substantially more stock than simulated demand. Consider spoilage and tied-up cash.",
      );
    }

    if (price > 140) {
      outcomes.push(
        "Pricing risk: the higher price reduced estimated demand in this simplified model.",
      );
    }

    setEvent(outcomes.join(" "));
    setTab("business");
  }

  async function askJudge() {
    const trimmed = answer.trim();
    if (!trimmed) return;

    setError("");
    setLoading(true);

    const founderMessage: Message = { role: "founder", text: trimmed };
    const nextMessages = [...messages, founderMessage];

    setMessages(nextMessages);
    setAnswer("");

    try {
      const payload = {
        judge: {
          name: judge.name,
          role: judge.role,
          focus: judge.focus,
          tone: judge.tone,
        },
        startup: profile,
        pitch: pitch || buildPitchText({ ventureName, solution, customer, problem }),
        history: nextMessages.slice(-8),
        answer: trimmed,
        round,
      };

      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "The judge could not respond. Please try again.");
      }

      setMessages((prev) => [...prev, { role: "judge", text: data.reply }]);
      if (typeof data.score === "number") {
        setReadiness(data.score);
      }
      if (data.feedback) {
        setFeedback(data.feedback);
      }
      setRound((value) => value + 1);
      setTab("den");
    } catch (err) {
      setMessages((prev) => prev.filter((message, index) => !(message.role === "founder" && index === prev.length - 1)));
      setError(err instanceof Error ? err.message : "Unexpected error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function evaluatePitch() {
    setError("");
    setLoading(true);

    try {
      const payload = {
        mode: "evaluate",
        judge: {
          name: judge.name,
          role: judge.role,
          focus: judge.focus,
          tone: judge.tone,
        },
        startup: profile,
        pitch: pitch || buildPitchText({ ventureName, solution, customer, problem }),
        history: messages.slice(-8),
        answer: "Provide a concise scorecard for the founder's current pitch and conversation.",
        round,
      };

      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not evaluate this pitch.");
      }

      setFeedback(data.feedback || data.reply || "");
      if (typeof data.score === "number") {
        setReadiness(data.score);
      }
      setTab("scorecard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">VA</div>
          <div>
            <strong>VENTURE ARENA</strong>
            <span>FOUNDER TRAINING GROUND</span>
          </div>
        </div>

        <div className="profile-chip">
          <div className="avatar">F</div>
          <div>
            <strong>Founder in Training</strong>
            <span>Level 01 · The Dreamer</span>
          </div>
        </div>

        <p className="nav-label">YOUR ARENA</p>
        <nav>
          {([
            ["overview", "◈", "Command Centre"],
            ["business", "▦", "Business Lab"],
            ["den", "⚖", "Investment Den"],
            ["scorecard", "▤", "Judge's Scorecard"],
          ] as const).map(([id, icon, label]) => (
            <button
              key={id}
              className={`nav-item ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
              type="button"
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="live-dot" />
          <span>SIMULATION MODE</span>
          <p>Virtual money only. No real investment is offered.</p>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">FOUNDER JOURNEY / LEVEL 01</span>
            <h1>
              {tab === "overview"
                ? "Command Centre"
                : tab === "business"
                  ? "Business Lab"
                  : tab === "den"
                    ? "Investment Den"
                    : "Judge's Scorecard"}
            </h1>
          </div>
          <button className="ghost-button" onClick={resetSimulation} type="button">
            Reset simulation
          </button>
        </header>

        {tab === "overview" && (
          <>
            <section className="hero-card">
              <div className="hero-copy">
                <span className="pill">YOUR JOURNEY STARTS HERE</span>
                <h2>
                  Build something
                  <br />
                  <em>worth backing.</em>
                </h2>
                <p>
                  Make decisions. Survive the numbers. Face the judges. Learn what it takes to build a business that can stand up to real scrutiny.
                </p>
              </div>

              <div className="hero-emblem">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="emblem-core">
                  <span>VA</span>
                  <small>
                    FOUNDER
                    <br />
                    READINESS
                  </small>
                </div>
              </div>
            </section>

            <div className="section-heading">
              <div>
                <span className="eyebrow">YOUR VENTURE</span>
                <h2>Build your business profile</h2>
              </div>
              <span className="subtle-tag">DRAFT PROFILE</span>
            </div>

            <div className="panel profile-form">
              <label>
                Business name
                <input
                  value={ventureName}
                  onChange={(event) => setVentureName(event.target.value)}
                  maxLength={80}
                />
              </label>

              <label>
                Customer problem
                <textarea
                  value={problem}
                  onChange={(event) => setProblem(event.target.value)}
                  rows={3}
                  maxLength={700}
                />
              </label>

              <label>
                Target customers
                <input
                  value={customer}
                  onChange={(event) => setCustomer(event.target.value)}
                  maxLength={180}
                />
              </label>

              <label>
                Your solution
                <textarea
                  value={solution}
                  onChange={(event) => setSolution(event.target.value)}
                  rows={3}
                  maxLength={700}
                />
              </label>

              <button
                className="primary-button"
                onClick={() => setTab("den")}
                type="button"
              >
                Take this venture to the Den <span>→</span>
              </button>
            </div>

            <div className="section-heading">
              <div>
                <span className="eyebrow">YOUR FIRST MISSION</span>
                <h2>Three steps to your first pitch</h2>
              </div>
            </div>

            <div className="mission-grid">
              <div className="mission-card">
                <span className="mission-number">01</span>
                <h3>Run your business</h3>
                <p>
                  Make your first set of operating decisions and see how the numbers behave under pressure.
                </p>
              </div>
              <div className="mission-card">
                <span className="mission-number">02</span>
                <h3>Earn credibility</h3>
                <p>
                  Reflect on what the numbers and market signals say before you ask investors for trust.
                </p>
              </div>
              <div className="mission-card">
                <span className="mission-number">03</span>
                <h3>Pitch with evidence</h3>
                <p>
                  Every claim is an invitation to justify it. Build a sharper, more defensible story.
                </p>
              </div>
            </div>
          </>
        )}

        {tab === "business" && (
          <>
            <div className="intro-row">
              <div>
                <span className="eyebrow">SCENARIO 01 / AGRIBUSINESS</span>
                <h2>FreshRoute Foods</h2>
                <p>Aggregate fresh produce from farmers and deliver to small retailers.</p>
              </div>
              <div className="sim-badge">
                {played ? "ROUND ACTIVE" : "READY TO START"}
              </div>
            </div>

            <div className="metric-grid">
              <Metric label="Cash balance" value={money(cash)} hint={cash < 0 ? "Critical: negative cash" : "Available virtual cash"} danger={cash < 0} />
              <Metric label="Cumulative revenue" value={money(revenue)} hint="Total sales generated" />
              <Metric label="Operating expenses" value={money(expenses)} hint="Cost base including stock and logistics" />
              <Metric label="Margin" value={`${margin}%`} hint={revenue > 0 ? "Current gross result" : "No sales yet"} />
            </div>

            <div className="panel">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">DECISION ROUND</span>
                  <h3>Allocate your resources</h3>
                </div>
                <span className="subtle-tag">ZMW · SIMULATED</span>
              </div>

              <div className="control-grid">
                <label>
                  Selling price per unit <strong>{money(price)}</strong>
                  <input
                    type="range"
                    min="80"
                    max="180"
                    step="5"
                    value={price}
                    onChange={(event) => setPrice(Number(event.target.value))}
                  />
                  <small>Higher prices protect margins, but may reduce demand.</small>
                </label>

                <label>
                  Stock to purchase <strong>{stock} units</strong>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    step="10"
                    value={stock}
                    onChange={(event) => setStock(Number(event.target.value))}
                  />
                  <small>Purchase cost is fixed at ZMW 65 per unit.</small>
                </label>

                <label>
                  Marketing budget <strong>{money(marketing)}</strong>
                  <input
                    type="range"
                    min="0"
                    max="2500"
                    step="100"
                    value={marketing}
                    onChange={(event) => setMarketing(Number(event.target.value))}
                  />
                  <small>More spend can raise reach, but increases fixed costs.</small>
                </label>

                <label>
                  Delivery cost <strong>{money(delivery)}</strong>
                  <input
                    type="range"
                    min="100"
                    max="1500"
                    step="50"
                    value={delivery}
                    onChange={(event) => setDelivery(Number(event.target.value))}
                  />
                  <small>Deliveries matter when demand grows and routes get complex.</small>
                </label>
              </div>

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={credit}
                  onChange={(event) => setCredit(event.target.checked)}
                />
                <span>
                  <strong>Offer customer credit</strong>
                  <small>Potentially attract more buyers, but cash conversion slows.</small>
                </span>
              </label>

              <div className="decision-preview">
                <div>
                  <span>Stock cost</span>
                  <strong>{money(stock * 65)}</strong>
                </div>
                <div>
                  <span>Planned operating spend</span>
                  <strong>{money(stock * 65 + marketing + delivery + 250)}</strong>
                </div>
                <div>
                  <span>Current runway</span>
                  <strong>{runway} periods</strong>
                </div>
              </div>

              <button
                className="primary-button"
                onClick={runPeriod}
                disabled={period > 6 || cash < 0 || loading}
                type="button"
              >
                Commit decisions & run period <span>→</span>
              </button>

              {period > 6 && (
                <p className="notice">You've completed the six-period demo. Reset the simulation to play again.</p>
              )}
            </div>

            <div className="panel outcome-panel">
              <div className="panel-title">
                <h3>Market intelligence</h3>
                <span className="subtle-tag">LATEST OUTCOME</span>
              </div>
              <p>{event}</p>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <small>Progress through the simulated operating cycle.</small>
            </div>
          </>
        )}

        {tab === "den" && (
          <>
            <div className="den-banner">
              <div>
                <span className="eyebrow">LIVE SIMULATION / ROUND {round}</span>
                <h2>Welcome to the Den.</h2>
                <p>Every claim is an invitation to ask for evidence.</p>
              </div>
              <button className="ghost-button" onClick={evaluatePitch} disabled={loading} type="button">
                Evaluate current pitch
              </button>
            </div>

            <div className="judge-layout">
              <div className="judge-list panel">
                <span className="eyebrow">CHOOSE YOUR CHALLENGER</span>
                {judges.map((option) => (
                  <button
                    key={option.id}
                    className={`judge-option ${option.id === judge.id ? "selected" : ""}`}
                    onClick={() => setJudgeId(option.id)}
                    type="button"
                  >
                    <div className="judge-avatar small">{option.initials}</div>
                    <div>
                      <strong>{option.name}</strong>
                      <span>{option.role}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="panel chat-panel">
                <div className="chat-header">
                  <div className="judge-avatar large">{judge.initials}</div>
                  <div>
                    <h3>{judge.name}</h3>
                    <span>
                      {judge.role} · {judge.focus}
                    </span>
                  </div>
                </div>

                <div className="chat-messages" aria-live="polite">
                  {messages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`message ${message.role}`}>
                      <span className="message-author">
                        {message.role === "judge" ? judge.name.toUpperCase() : "YOU"}
                      </span>
                      <p>{message.text}</p>
                    </div>
                  ))}
                </div>

                <div className="answer-box">
                  <label>
                    Your response
                    <textarea
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      rows={4}
                      maxLength={2000}
                      placeholder="Answer the judge directly. Press the button when you're ready."
                    />
                  </label>

                  <div className="chat-actions">
                    <button
                      className="primary-button"
                      onClick={askJudge}
                      disabled={loading || !answer.trim()}
                      type="button"
                    >
                      {loading ? "Judge is thinking..." : "Send to judge"}
                    </button>
                  </div>
                </div>

                <div className="pitch-fields">
                  <label>
                    Pitch summary (optional)
                    <textarea
                      value={pitch}
                      onChange={(event) => setPitch(event.target.value)}
                      rows={2}
                      maxLength={2500}
                      placeholder="Describe the problem, customer, offer and traction in a few lines."
                    />
                  </label>
                </div>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}
            <div className="disclaimer">
              AI feedback is for practice and education. It is not an investment recommendation or a guarantee of funding.
            </div>
          </>
        )}

        {tab === "scorecard" && (
          <>
            <div className="intro-row">
              <div>
                <span className="eyebrow">PERFORMANCE REVIEW</span>
                <h2>Your Founder Scorecard</h2>
                <p>Use feedback to strengthen your next attempt.</p>
              </div>
              <button className="ghost-button" onClick={() => setTab("den")} type="button">
                Return to den
              </button>
            </div>

            <div className="score-hero panel">
              <div className="score-ring">
                <strong>{readiness ?? "—"}</strong>
                <span>/ 100</span>
              </div>
              <div>
                <span className="eyebrow">CURRENT READINESS ESTIMATE</span>
                <h3>
                  {readiness === null
                    ? "No assessment yet"
                    : readiness >= 80
                      ? "Strong founder signal"
                      : readiness >= 60
                        ? "Promising but needs sharper evidence"
                        : readiness >= 40
                          ? "There is potential, but the model is still weak"
                          : "Critical gaps remain"}
                </h3>
                <p>
                  {feedback
                    ? "The judge is evaluating whether this venture is investable, understandable and executable."
                    : "Submit a pitch or answer the judge to generate an assessment."}
                </p>
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">
                <h3>Judge feedback</h3>
                <span className="subtle-tag">LATEST ASSESSMENT</span>
              </div>

              {feedback ? (
                <div className="feedback-content">{feedback}</div>
              ) : (
                <p className="muted">No feedback yet. Head back to the den and challenge the model.</p>
              )}
            </div>

            <div className="panel">
              <h3>Competencies to develop</h3>
              <div className="competency-list">
                {[
                  "Customer validation",
                  "Business model clarity",
                  "Financial literacy",
                  "Operational readiness",
                  "Pitch confidence",
                ].map((item) => (
                  <span key={item} className="competency-pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        <footer>
          <span>VENTURE ARENA © 2026</span>
          <span>BUILD. SURVIVE. PITCH. RISE.</span>
          <span>Prototype · No real money involved</span>
        </footer>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  hint,
  danger = false,
}: {
  label: string;
  value: string;
  hint: string;
  danger?: boolean;
}) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong className={danger ? "negative" : ""}>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}
