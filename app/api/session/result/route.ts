import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Session from "@/models/Session";
import Question from "@/models/Question";
import { SCALE_SCORE_MAP } from "@/lib/scale";
import { DISORDER_CONFIG } from "@/lib/disorders";
import { DISORDER_KEYS } from "@/types/disorder";
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
    });

    if (!session) {
      return jsonError("Session not found", 404, "not_found");
    }

    const total = await Question.countDocuments({ isActive: true });
    if (session.currentQuestionIndex >= total && session.status !== "completed") {
      session.status = "completed";
      await session.save();
    }

    const questionIds = session.answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } })
      .select("_id category")
      .lean();

    const questionMap = new Map(
      questions.map((q) => [q._id.toString(), q])
    );

    const scores: Record<string, number> = {};

    for (const answer of session.answers) {
      const question = questionMap.get(answer.questionId.toString());
      if (!question) continue;

      const score = SCALE_SCORE_MAP[answer.option] ?? 0;
      scores[question.category] = (scores[question.category] || 0) + score;
    }

    const results = DISORDER_KEYS.map((key) => {
      const config = DISORDER_CONFIG[key];
      const score = scores[key] ?? 0;

      return {
        key,
        label: config.label,
        testName: config.testName,
        score,
        severity: config.severity(score),
      };
    });

    const dominant = results.reduce((max, current) => {
      if (!max) return current.score > 0 ? current : null;
      return current.score > max.score ? current : max;
    }, null as (typeof results)[number] | null);

    return jsonOk({
      results,
      dominant,
    });
  } catch (error) {
    logger.error("SESSION_RESULT_ERROR", error);
    return jsonError("Failed to load results", 500, "server_error");
  }
}
