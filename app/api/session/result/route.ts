import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Session from "@/models/Session";
import Question from "@/models/Question";
import { SCALE_SCORE_MAP } from "@/lib/scale";
import { DISORDER_CONFIG, DisorderKey } from "@/lib/disorders";

export async function GET(req: Request) {
  const authSession = await getServerSession(authOptions);

  if (!authSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = new URL(req.url).searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID required" },
      { status: 400 }
    );
  }

  await dbConnect();

  const session = await Session.findById(sessionId);
  if (!session) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  const questionIds = session.answers.map((a) => a.questionId);
  const questions = await Question.find({ _id: { $in: questionIds } });

  const questionMap = new Map(
    questions.map((q) => [q._id.toString(), q])
  );

  const scores: Record<string, number> = {};

  for (const a of session.answers) {
    const q = questionMap.get(a.questionId.toString());
    if (!q) continue;

    const score = SCALE_SCORE_MAP[a.option as keyof typeof SCALE_SCORE_MAP] ?? 0;
    scores[q.category] = (scores[q.category] || 0) + score;
  }

  const results = Object.entries(scores).map(([key, score]) => {
    const config = DISORDER_CONFIG[key as DisorderKey];
    return {
      key,
      label: config.label,
      testName: config.testName,
      score,
      severity: config.severity(score),
    };
  });

  const dominant =
    results.sort((a, b) => b.score - a.score)[0] ?? null;

  return NextResponse.json({
    results,
    dominant,
  });
}
