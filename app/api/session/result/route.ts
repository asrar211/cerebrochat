import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Session from "@/models/Session";
import type { ISession } from "@/models/Session";
import Question from "@/models/Question";
import { SCALE_SCORE_MAP } from "@/lib/scale";
import { DISORDER_CONFIG } from "@/lib/disorders";
import { DISORDER_KEYS, type DisorderKey } from "@/types/disorder";
import { jsonError, jsonOk, zodErrorsToFieldMap } from "@/lib/api/response";
import { sessionQuerySchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  const authSession = await getServerSession(authOptions);

  if (!authSession?.user?.id) {
    return jsonError("Unauthorized", 401, "unauthorized");
  }

  const sessionId = new URL(req.url).searchParams.get("sessionId") ?? "";

  const parsed = sessionQuerySchema.safeParse({ sessionId });
  if (!parsed.success) {
    return jsonError(
      "Invalid session id",
      400,
      "validation_error",
      zodErrorsToFieldMap(parsed.error)
    );
  }

  try {
    await dbConnect();

    const session = await Session.findOne({
      _id: parsed.data.sessionId,
      userId: authSession.user.id,
    }).lean<ISession>();

    if (!session) {
      return jsonError("Session not found", 404, "not_found");
    }

    const total = await Question.countDocuments({ isActive: true });
    if (session.currentQuestionIndex >= total && session.status !== "completed") {
      session.status = "completed";
      await session.save();
    }

    const questionIds = session.answers.map((answer) => answer.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } })
      .select("_id category")
      .lean();

    const questionMap = new Map(
      questions.map((q) => [q._id.toString(), q])
    );

    const scores: Record<DisorderKey, number> = {
      depression: 0,
      anxiety: 0,
      stress: 0,
      adhd: 0,
      ocd: 0,
    };
    const counts: Record<DisorderKey, number> = {
      depression: 0,
      anxiety: 0,
      stress: 0,
      adhd: 0,
      ocd: 0,
    };

    for (const answer of session.answers) {
      const question = questionMap.get(answer.questionId.toString());
      if (!question) continue;

      const score = SCALE_SCORE_MAP[answer.option] ?? 0;
      const category = question.category as DisorderKey;
      scores[category] += score;
      counts[category] += 1;
    }

    const maxScaleScore = Math.max(...Object.values(SCALE_SCORE_MAP));
    const normalizedScores = DISORDER_KEYS.reduce((acc, key) => {
      const count = counts[key];
      acc[key] = count > 0 ? scores[key] / (count * maxScaleScore) : 0;
      return acc;
    }, {} as Record<DisorderKey, number>);

    const results = DISORDER_KEYS.map((key) => {
      const config = DISORDER_CONFIG[key];
      const score = scores[key] ?? 0;

      return {
        key,
        label: config.label,
        testName: config.testName,
        score,
        severity: config.severity(score),
        normalizedScore: normalizedScores[key],
      };
    });

    const dominantKey = DISORDER_KEYS.reduce<DisorderKey | null>((best, key) => {
      if (normalizedScores[key] <= 0) {
        return best;
      }
      if (!best) return key;
      return normalizedScores[key] > normalizedScores[best] ? key : best;
    }, null);

    const dominant =
      dominantKey ? results.find((item) => item.key === dominantKey) ?? null : null;

    return jsonOk({
      results,
      dominant,
    });
  } catch (error) {
    logger.error("SESSION_RESULT_ERROR", error);
    return jsonError("Failed to load results", 500, "server_error");
  }
}
