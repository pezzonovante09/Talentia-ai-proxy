export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function OPTIONS() {
  return json({}, 200);
}

export async function GET() {
  return new Response("ok", { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const totalCorrect = Number(body.totalCorrect ?? 0);
    const totalAttempts = Number(body.totalAttempts ?? 0);
    const streakCount = Number(body.streakCount ?? 0);

    const accuracy =
      totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    let strongSides: string[] = [];
    let weakSides: string[] = [];
    let advice: string[] = [];

    if (accuracy >= 80) {
      strongSides.push("Good accuracy and stable understanding.");
    } else if (accuracy >= 50) {
      strongSides.push("Shows partial understanding and can improve with practice.");
      weakSides.push("Makes repeated mistakes in some tasks.");
    } else {
      weakSides.push("Needs more support with core concepts.");
    }

    if (streakCount >= 3) {
      strongSides.push("Good learning consistency.");
    } else {
      weakSides.push("Learning routine is not stable yet.");
      advice.push("Try 5-10 minutes of practice every day.");
    }

    if (accuracy < 70) {
      advice.push("Repeat easier tasks before moving to harder ones.");
      advice.push("Use short guided hints and celebrate small wins.");
    } else {
      advice.push("Gradually increase difficulty and add variety.");
    }

    if (strongSides.length === 0) strongSides.push("The child is engaging with the app.");
    if (weakSides.length === 0) weakSides.push("No major weak areas detected yet.");
    if (advice.length === 0) advice.push("Keep a steady routine and encourage curiosity.");

    return json({ strongSides, weakSides, advice });
  } catch (e: any) {
    return json({ error: "Server error", details: String(e?.message || e) }, 500);
  }
}