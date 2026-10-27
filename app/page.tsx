"use client";

import { useMemo, useState } from "react";

type Tab = "overview" | "business" | "den" | "scorecard";
type JudgeDifficulty = "easy" | "medium" | "hard";

type Judge = {
  id: string;
  name: string;
  role: string;
  focus: string;
  initials: string;
  tone: string;
  difficulty: JudgeDifficulty;
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
    difficulty: "hard",
  },
  {
    id: "cfo",
    name: "The CFO",
    role: "Financial Strategist",
    focus: "cash flow, margins, break-even and unit economics",
    initials: "CF",
    tone: "Precise, numbers-first and intolerant of financial confusion.",
    difficulty: "hard",
  },
  {
    id: "market",
    name: "The Market Hawk",
    role: "Market Strategist",
    focus: "customer demand, competition and route to market",
    initials: "MH",
    tone: "Curious, challenging and evidence-driven.",
    difficulty: "medium",
  },
  {
    id: "operator",
    name: "The Operator",
    role: "Execution Expert",
    focus: "operations, supply chain, hiring and delivery risks",
    initials: "OP",
    tone: "Practical, focused on execution and contingency planning.",
    difficulty: "medium",
  },
  {
    id: "impact",
    name: "The Impact Investor",
    role: "Impact & Sustainability",
    focus: "measurable impact, resilience and commercial sustainability",
    initials: "II",
    tone: "Mission-minded but expects evidence, discipline and accountability.",
    difficulty: "easy",
  },
];

const tabs: Tab[] = ["overview", "business", "den", "scorecard"];

const periodOutcomes: PeriodOutcome[] = [
  {
    stockCost: 26,
    demand: 82,
    unitsSold: 182,
    sales: 4732,
    operatingCosts: 2910,
    nextProfit: 1822,
    creditDelay: 6,
    nextCash: 14850,
    customerIncrement: 18,
  },
  {
    stockCost: 28,
    demand: 90,
    unitsSold: 206,
    sales: 5768,
    operatingCosts: 3240,
    nextProfit: 2528,
    creditDelay: 4,
    nextCash: 17160,
    customerIncrement: 21,
  },
  {
    stockCost: 31,
    demand: 101,
    unitsSold: 239,
    sales: 7409,
    operatingCosts: 3700,
    nextProfit: 3709,
    creditDelay: 3,
    nextCash: 20870,
    customerIncrement: 27,
  },
];

const founderMessages: Message[] = [
  { role: "founder", text: "We are starting with an affordable energy drink tailored to students and commuters." },
  { role: "judge", text: "The market is urgent, but your unit economics need proof before I back the scale-up." },
  { role: "founder", text: "We validated demand in three towns and have a repeatable route-to-market plan." },
  { role: "judge", text: "Good. Show me the cash conversion and your inventory risk plan." },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>(judges?.[0]?.id ?? "");

  const activeJudge = useMemo(
    () => judges.find((judge) => judge.id === selectedJudgeId) ?? judges[0],
    [selectedJudgeId],
  );

  const latestPeriod: PeriodOutcome =
    periodOutcomes[periodOutcomes.length - 1] ?? {
      stockCost: 0,
      demand: 0,
      unitsSold: 0,
      sales: 0,
      operatingCosts: 0,
      nextProfit: 0,
      creditDelay: 0,
      nextCash: 0,
      customerIncrement: 0,
    };
  const revenueGoal = 10000;
  const readinessScore = 82;

  return (
    <main style={{ minHeight: "100vh", background: "#020817", color: "#e2e8f0", padding: "32px 20px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 12, letterSpacing: 3, color: "#a5b4fc", textTransform: "uppercase" }}>
              Venture Arena
            </p>
            <h1 style={{ margin: "8px 0 0", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>Build. Survive. Pitch. Rise.</h1>
          </div>
          <button
            type="button"
            style={{
              background: "linear-gradient(135deg, #38bdf8, #8b5cf6)",
              border: "none",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: 999,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Start Simulation
          </button>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
            marginBottom: 40,
          }}
        >
          {[
            { label: "Active founders", value: "1,248" },
            { label: "Avg. readiness", value: "82%" },
            { label: "Capital tracked", value: "ZMW 4.2M" },
            { label: "Investor feedback", value: "4.9/5" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(148, 163, 184, 0.24)",
                borderRadius: 18,
                padding: 20,
              }}
            >
              <div style={{ color: "#94a3b8", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" }}>
                {stat.label}
              </div>
              <div style={{ marginTop: 12, fontSize: 28, fontWeight: 700 }}>{stat.value}</div>
            </div>
          ))}
        </section>

        <section
          style={{
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(148, 163, 184, 0.24)",
            borderRadius: 24,
            padding: 20,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  background: activeTab === tab ? "#1d4ed8" : "transparent",
                  color: activeTab === tab ? "#fff" : "#cbd5e1",
                  borderRadius: 999,
                  padding: "10px 16px",
                  textTransform: "capitalize",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
            <div>
              <h2 style={{ margin: "0 0 12px", fontSize: 26 }}>Founder readiness snapshot</h2>
              <p style={{ color: "#cbd5e1", lineHeight: 1.7, margin: 0 }}>
                The simulation pushes founders to test pricing, customer demand, execution risk, and investor credibility
                before they reach the final pitch.
              </p>

              <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
                {[
                  ["Revenue goal", `ZMW ${revenueGoal.toLocaleString()}`],
                  ["Cash runway", `ZMW ${latestPeriod.nextCash.toLocaleString()}`],
                  ["Demand index", `${latestPeriod.demand}/100`],
                  ["Operating cost", `ZMW ${latestPeriod.operatingCosts.toLocaleString()}`],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: "#0f172a", borderRadius: 14, padding: 14 }}>
                    <div style={{ color: "#94a3b8", fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase" }}>{label}</div>
                    <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#0f172a", borderRadius: 18, padding: 20 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" }}>Live panel</div>
              <div style={{ marginTop: 20, fontSize: 42, fontWeight: 800, color: "#f8fafc" }}>{readinessScore}%</div>
              <div style={{ marginTop: 8, color: "#a5b4fc", fontWeight: 600 }}>Founder readiness score</div>
              <div style={{ marginTop: 18, height: 10, background: "#1e293b", borderRadius: 999, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${readinessScore}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #22c55e, #38bdf8, #8b5cf6)",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(148, 163, 184, 0.24)",
              borderRadius: 24,
              padding: 20,
            }}
          >
            <h2 style={{ margin: "0 0 18px" }}>Judge panel</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              {judges.map((judge) => (
                <button
                  key={judge.id}
                  type="button"
                  onClick={() => setSelectedJudgeId(judge.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    borderRadius: 999,
                    border: selectedJudgeId === judge.id ? "1px solid #60a5fa" : "1px solid rgba(148, 163, 184, 0.25)",
                    background: selectedJudgeId === judge.id ? "rgba(96, 165, 250, 0.15)" : "transparent",
                    color: "#e2e8f0",
                    padding: "10px 14px",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "#1e293b",
                      fontWeight: 700,
                    }}
                  >
                    {judge.initials}
                  </span>
                  <span>{judge.name}</span>
                </button>
              ))}
            </div>

            <div style={{ background: "#0f172a", borderRadius: 18, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "#a5b4fc", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" }}>{activeJudge.role}</div>
                  <h3 style={{ margin: "6px 0 0", fontSize: 30 }}>{activeJudge.name}</h3>
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(14, 165, 233, 0.15)",
                    color: "#7dd3fc",
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: "uppercase",
                  }}
                >
                  {activeJudge.difficulty}
                </span>
              </div>

              <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginTop: 18 }}><strong>Focus:</strong> {activeJudge.focus}</p>
              <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginTop: 10 }}><strong>Tone:</strong> {activeJudge.tone}</p>
            </div>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(148, 163, 184, 0.24)",
              borderRadius: 24,
              padding: 20,
            }}
          >
            <h2 style={{ margin: "0 0 18px" }}>Recent round</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                ["Stock cost", `ZMW ${latestPeriod.stockCost}`],
                ["Units sold", latestPeriod.unitsSold.toLocaleString()],
                ["Sales", `ZMW ${latestPeriod.sales.toLocaleString()}`],
                ["Profit", `ZMW ${latestPeriod.nextProfit.toLocaleString()}`],
                ["Credit delay", `${latestPeriod.creditDelay} days`],
                ["Customer growth", `+${latestPeriod.customerIncrement}%`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8, borderBottom: "1px solid rgba(148, 163, 184, 0.18)", paddingBottom: 8 }}>
                  <span style={{ color: "#cbd5e1" }}>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(148, 163, 184, 0.24)",
              borderRadius: 24,
              padding: 20,
            }}
          >
            <h2 style={{ margin: "0 0 16px" }}>Founder Q&A</h2>
            <div style={{ display: "grid", gap: 14 }}>
              {founderMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  style={{
                    maxWidth: message.role === "founder" ? "85%" : "92%",
                    marginLeft: message.role === "judge" ? "auto" : 0,
                    background: message.role === "founder" ? "#0f172a" : "#1d4ed8",
                    color: "#f8fafc",
                    borderRadius: 16,
                    padding: "12px 14px",
                    lineHeight: 1.6,
                  }}
                >
                  {message.text}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(148, 163, 184, 0.24)",
              borderRadius: 24,
              padding: 20,
            }}
          >
            <h2 style={{ margin: "0 0 16px" }}>Scorecard</h2>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                { label: "Product-market fit", value: 86 },
                { label: "Unit economics", value: 74 },
                { label: "Execution risk", value: 81 },
                { label: "Investor confidence", value: 89 },
              ].map((entry) => (
                <div key={entry.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span>{entry.label}</span>
                    <strong>{entry.value}</strong>
                  </div>
                  <div style={{ height: 8, background: "#1e293b", borderRadius: 999, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${entry.value}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #34d399, #38bdf8)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
