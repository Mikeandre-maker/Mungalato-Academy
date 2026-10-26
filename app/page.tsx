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
