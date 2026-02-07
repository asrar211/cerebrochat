import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Session from "@/models/Session";
import Question from "@/models/Question";
import { jsonError, jsonOk, zodErrorsToFieldMap } from "@/lib/api/response";
import { answerSchema } from "@/lib/validation/schemas";
import { readJson } from "@/lib/api/parse";
import { logger } from "@/lib/logger";
import { ScaleOption } from "@/lib/scale";

export async function POST(req: Request) {
  const authSession = await getServerSession(authOptions);

  if (!authSession?.user?.id) {
    return jsonError("Unauthorized", 401, "unauthorized");
  }

  const body = await readJson(req);
  if (!body) {
    return jsonError("Invalid JSON payload", 400, "invalid_json");
  }

  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "Please check the highlighted fields",
      400,
      "validation_error",
      zodErrorsToFieldMap(parsed.error)
    );
  }

  try {
    await dbConnect();

    const { sessionId, questionId, option } = parsed.data;

    const session = await Session.findOne({
      _id: sessionId,
      userId: authSession.user.id,
    });

    if (!session) {
      return jsonError("Session not found", 404, "not_found");
    }

    if (session.status === "completed") {
      return jsonError("Session already completed", 409, "session_completed");
    }

    const total = await Question.countDocuments({ isActive: true });

    const currentQuestion = await Question.find({ isActive: true })
      .sort({ order: 1 })
      .skip(session.currentQuestionIndex)
      .limit(1)
      .select("_id options")
      .lean();

    const expectedQuestion = currentQuestion[0];

    if (!expectedQuestion) {
      session.status = "completed";
      await session.save();
      return jsonError("Session already completed", 409, "session_completed");
    }

    if (expectedQuestion._id.toString() !== questionId) {
      return jsonError("Answer out of order", 409, "out_of_order");
    }

    const hasCustomOptions =
      Array.isArray(expectedQuestion.options) &&
      expectedQuestion.options.length > 0;

    if (hasCustomOptions) {
      const isValidCustom = expectedQuestion.options.some(
        (opt: { value: string }) => opt.value === option
      );
      if (!isValidCustom) {
        return jsonError("Invalid option", 400, "invalid_option");
      }
    } else {
      const isValidScale = Object.values(ScaleOption).includes(
        option as ScaleOption
      );
      if (!isValidScale) {
        return jsonError("Invalid option", 400, "invalid_option");
      }
    }

    session.answers.push({ questionId, option });
    session.currentQuestionIndex += 1;

    if (session.currentQuestionIndex >= total) {
      session.status = "completed";
    }

    await session.save();

    return jsonOk({ status: session.status });
  } catch (error) {
    logger.error("SESSION_ANSWER_ERROR", error);
    return jsonError("Failed to submit answer", 500, "server_error");
  }
}
