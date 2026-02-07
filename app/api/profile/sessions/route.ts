import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Session from "@/models/Session";
import Question from "@/models/Question";
import { jsonError, jsonOk, zodErrorsToFieldMap } from "@/lib/api/response";
import { sessionsQuerySchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";
import { SCALE_SCORE_MAP, ScaleOption } from "@/lib/scale";
import { DISORDER_CONFIG } from "@/lib/disorders";
import { DISORDER_KEYS, type DisorderKey } from "@/types/disorder";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401, "unauthorized");
  }

  const limitParam = new URL(req.url).searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const parsed = sessionsQuerySchema.safeParse({ limit });

  if (!parsed.success) {
    return jsonError(
      "Invalid query parameters",
      400,
      "validation_error",
      zodErrorsToFieldMap(parsed.error)
    );
  }

  try {
    await dbConnect();

    const totalQuestions = await Question.countDocuments({ isActive: true });

    const sessions = await Session.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(parsed.data.limit ?? 10)
      .lean();

    if (sessions.length === 0) {
      return jsonOk({ sessions: [] });
    }

    const allQuestionIds = new Set<string>();
    for (const s of sessions) {
      for (const answer of s.answers) {
        allQuestionIds.add(answer.questionId.toString());
      }
    }

    const questions = await Question.find({
      _id: { $in: Array.from(allQuestionIds) },
    })
      .select("_id category options")
      .lean();

    const questionMap = new Map<
      string,
      { category: DisorderKey; options?: { value: string; score: number }[] }
    >(
      questions.map((q) => [
        q._id.toString(),
        {
          category: q.category as DisorderKey,
          options: q.options ?? undefined,
        },
      ])
    );

    const summaries = sessions.map((sessionItem) => {
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
      const defaultMaxScore = Math.max(...Object.values(SCALE_SCORE_MAP));

      for (const answer of sessionItem.answers) {
        const question = questionMap.get(answer.questionId.toString());
        if (!question) continue;
        const category = question.category;
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
          severity: config.severity(score),
          score,
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

      return {
        id: sessionItem._id.toString(),
        createdAt: sessionItem.createdAt.toISOString(),
        status: sessionItem.status,
        answersCount: sessionItem.answers.length,
        totalQuestions,
        dominant,
      };
    });

    return jsonOk({ sessions: summaries });
  } catch (error) {
    logger.error("PROFILE_SESSIONS_ERROR", error);
    return jsonError("Failed to load sessions", 500, "server_error");
  }
}
