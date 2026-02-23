export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return json({ error: "Missing DEEPSEEK_API_KEY" }, 500);

    const body = await req.json().catch(() => ({}));
    const language = body.language ?? "en";
    const methodology = body.methodology ?? "mixed";
    const modes = body.modes ?? { calm: false, focus: false };
    const childAgeBand = body.childAgeBand ?? "7-8";
    const userMessage = String(body.userMessage ?? "");

    if (!userMessage.trim()) return json({ error: "userMessage is required" }, 400);
    if (userMessage.length > 500) return json({ error: "userMessage too long" }, 400);

    const system = [
      "You are Tali, a friendly learning buddy for kids aged 5–8.",
      `Reply in ${language}.`,
      "Use 1–2 short sentences.",
      "Never give the exact final answer. Give a hint or a guiding question.",
      `Methodology: ${methodology}. Calm: ${!!modes.calm}. Focus: ${!!modes.focus}. Age: ${childAgeBand}.`,
    ].join(" ");

    const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 120,
      }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: "DeepSeek error", status: r.status, details: data }, r.status);

    const reply = data?.choices?.[0]?.message?.content?.trim() || "…";
    return json({ reply }, 200);
  } catch (e: any) {
    return json({ error: "Server error", details: String(e?.message || e) }, 500);
  }
}