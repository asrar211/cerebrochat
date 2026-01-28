import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import {dbConnect} from "@/lib/db";
import Session from "@/models/Session";
import Question from "@/models/Question";
import { SCALE_SCORE_MAP } from "@/lib/scale";
import { getPHQ9Severity, getGAD7Severity } from "@/lib/severity";

export async function GET(req: Request) {
  const authSession = await getServerSession(authOptions);

  if (!authSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = new URL(req.url).searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  await dbConnect();

  const session = await Session.findById(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  let depressionScore = 0;
  let anxietyScore = 0;

  for (const a of session.answers) {
    const q = await Question.findById(a.questionId);
    if (!q) continue;

    const score = SCALE_SCORE_MAP[a.option as keyof typeof SCALE_SCORE_MAP] ?? 0;

    if (q.category === "depression") depressionScore += score;
    if (q.category === "anxiety") anxietyScore += score;
  }

  return NextResponse.json({
    depression: {
      score: depressionScore,
      severity: getPHQ9Severity(depressionScore),
    },
    anxiety: {
      score: anxietyScore,
      severity: getGAD7Severity(anxietyScore),
    },
  });
}
