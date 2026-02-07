import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Session from "@/models/Session";
import type { ISession } from "@/models/Session";
import Question from "@/models/Question";
import { SCALE_SCORE_MAP, ScaleOption } from "@/lib/scale";
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
    });

    if (!session) {
      return jsonError("Session not found", 404, "not_found");
    }

    const total = await Question.countDocuments({ isActive: true });
    if (session.currentQuestionIndex >= total && session.status !== "completed") {
      session.status = "completed";
      await session.save();
    }

    const questionIds = session.answers.map(
      (answer: ISession["answers"][number]) => answer.questionId
    );
    const questions = await Question.find({ _id: { $in: questionIds } })
      .select("_id category options order")
      .lean();

    const questionMap = new Map<
      string,
      {
        category: DisorderKey;
        options?: { value: string; score: number }[];
        order: number;
      }
    >(
      questions.map((q) => [
        q._id.toString(),
        {
          category: q.category as DisorderKey,
          options: q.options ?? undefined,
          order: q.order,
        },
      ])
    );

    const scores: Record<DisorderKey, number> = {
      depression: 0,
      anxiety: 0,
      stress: 0,
      adhd: 0,
      ocd: 0,
    };
    const maxPossible: Record<DisorderKey, number> = {
      depression: 0,
      anxiety: 0,
      stress: 0,
      adhd: 0,
      ocd: 0,
    };

    let safetyFlag = false;
    const defaultMaxScore = Math.max(...Object.values(SCALE_SCORE_MAP));

    for (const answer of session.answers) {
      const question = questionMap.get(answer.questionId.toString());
      if (!question) continue;

      const category = question.category as DisorderKey;
      let score = 0;

      if (question.options && question.options.length > 0) {
        const matched = question.options.find(
          (opt) => opt.value === answer.option
        );
        if (matched) {
          score = matched.score;
        }
      } else {
        const option = answer.option as ScaleOption;
        if (Object.values(ScaleOption).includes(option)) {
          score = SCALE_SCORE_MAP[option] ?? 0;
        }
      }

      scores[category] += score;
      const maxScoreForQuestion =
        question.options && question.options.length > 0
          ? Math.max(...question.options.map((opt) => opt.score))
          : defaultMaxScore;
      maxPossible[category] += maxScoreForQuestion;

      if (category === "depression" && question.order === 8 && score > 0) {
        safetyFlag = true;
      }
    }

    const normalizedScores = DISORDER_KEYS.reduce((acc, key) => {
      const possible = maxPossible[key];
      acc[key] = possible > 0 ? scores[key] / possible : 0;
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
      safetyFlag,
    });
  } catch (error) {
    logger.error("SESSION_RESULT_ERROR", error);
    return jsonError("Failed to load results", 500, "server_error");
  }
}
