import OpenAI from "openai";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

type ChatMessage = { role: "judge" | "founder"; text: string };

type JudgeRequest = {
  mode?: "chat" | "evaluate";
  judge: { name: string; role: string; focus: string; tone: string };
  startup: unknown;
  pitch: string;
  history: ChatMessage[];
  answer: string;
  round: number;
};

const RATE_LIMIT = Number(process.env.JUDGE_RATE_LIMIT_PER_HOUR) || 30;
const WINDOW_MS = 60 * 60 * 1000;
const requestLog = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (requestLog.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    requestLog.set(key, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(key, recent);
  return false;
}

const clip = (value: unknown, max: number) =>
  typeof value === "string" ? value.slice(0, max) : "";

function parseBody(body: unknown): JudgeRequest | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;
  const judge = data.judge as Record<string, unknown> | undefined;
  if (!judge || typeof judge !== "object") return null;

  const history = Array.isArray(data.history)
    ? (data.history as unknown[])
        .filter(
          (item): item is ChatMessage =>
            !!item &&
            typeof item === "object" &&
            ((item as ChatMessage).role === "judge" || (item as ChatMessage).role === "founder") &&
            typeof (item as ChatMessage).text === "string",
        )
        .slice(-8)
        .map((item) => ({ role: item.role, text: item.text.slice(0, 2000) }))
    : [];

  return {
    mode: data.mode === "evaluate" ? "evaluate" : "chat",
    judge: {
      name: clip(judge.name, 80),
      role: clip(judge.role, 80),
      focus: clip(judge.focus, 200),
      tone: clip(judge.tone, 200),
    },
    startup: data.startup ?? {},
    pitch: clip(data.pitch, 2500),
    history,
    answer: clip(data.answer, 2000),
    round: typeof data.round === "number" ? data.round : 1,
  };
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "The judges are offline: OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "You've reached the hourly limit for judge sessions. Please try again later." },
      { status: 429 },
    );
  }

  let input: JudgeRequest | null = null;
  try {
    input = parseBody(await req.json());
  } catch {
    input = null;
  }
  if (!input) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { judge, startup, pitch, history, answer, round, mode } = input;

  const system = [
    `You are ${judge.name}, ${judge.role}, a judge in "Venture Arena", an educational entrepreneurship simulation for African founders.`,
    `Your focus: ${judge.focus}. Your tone: ${judge.tone}`,
    "All money is virtual (ZMW). Never promise real investment. Be rigorous but constructive, and keep replies concise (under 150 words).",
    "Respond ONLY with JSON: {\"reply\": string, \"score\": number (0-100 founder readiness), \"feedback\": string}.",
    mode === "evaluate"
      ? "This is an evaluation: \"feedback\" must be a structured scorecard with strengths, weaknesses and 3 concrete next steps. \"reply\" is a one-line verdict."
      : "In \"reply\", react to the founder's answer and ask exactly one sharp follow-up question. Keep \"feedback\" to 2-3 sentences of coaching.",
  ].join("\n");

  const context = `Round ${round}.\nStartup profile: ${JSON.stringify(startup).slice(0, 4000)}\nPitch: ${pitch}`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: system },
    { role: "user", content: context },
    ...history.map(
      (message): OpenAI.Chat.ChatCompletionMessageParam => ({
        role: message.role === "judge" ? "assistant" : "user",
        content: message.text,
      }),
    ),
  ];

  if (mode === "evaluate") {
    messages.push({ role: "user", content: answer });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { reply?: unknown; score?: unknown; feedback?: unknown };

    const score =
      typeof parsed.score === "number" ? Math.max(0, Math.min(100, Math.round(parsed.score))) : null;

    return NextResponse.json({
      reply: typeof parsed.reply === "string" ? parsed.reply : "Let's continue. Tell me more.",
      score,
      feedback: typeof parsed.feedback === "string" ? parsed.feedback : "",
    });
  } catch (error) {
  console.error("Judge API failure:", {
    message:
      error instanceof Error ? error.message : "Unknown error",
    status:
  });

  return Response.json(
    { error: "The judge could not respond. Please try again." },
    { status: 500 }
  );
}
