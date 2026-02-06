import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/db";
import Session from "@/models/Session";
import Question from "@/models/Question";
import { authOptions } from "@/lib/auth";
import { jsonError, jsonOk, zodErrorsToFieldMap } from "@/lib/api/response";
import { sessionQuerySchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401, "unauthorized");
    }

    await dbConnect();

    const testSession = await Session.create({
      userId: session.user.id,
    });

    return jsonOk({ sessionId: testSession._id.toString() }, { status: 201 });
  } catch (error) {
    logger.error("SESSION_CREATE_ERROR", error);
    return jsonError("Failed to create session", 500, "server_error");
  }
}

export async function GET(req: Request) {
  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession?.user?.id) {
      return jsonError("Unauthorized", 401, "unauthorized");
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId") ?? "";

    const parsed = sessionQuerySchema.safeParse({ sessionId });
    if (!parsed.success) {
      return jsonError(
        "Invalid session id",
        400,
        "validation_error",
        zodErrorsToFieldMap(parsed.error)
      );
    }

    await dbConnect();

    const testSession = await Session.findOne({
      _id: parsed.data.sessionId,
      userId: authSession.user.id,
    });

    if (!testSession) {
      return jsonError("Session not found", 404, "not_found");
    }

    const total = await Question.countDocuments({ isActive: true });

    if (total === 0) {
      return jsonOk({
        status: "completed",
        question: null,
        currentIndex: 0,
        total: 0,
      });
    }

    if (testSession.status === "completed") {
      return jsonOk({
        status: "completed",
        question: null,
        currentIndex: total,
        total,
      });
    }

    if (testSession.currentQuestionIndex >= total) {
      testSession.status = "completed";
      await testSession.save();

      return jsonOk({
        status: "completed",
        question: null,
        currentIndex: total,
        total,
      });
    }

    const nextQuestion = await Question.find({ isActive: true })
      .sort({ order: 1 })
      .skip(testSession.currentQuestionIndex)
      .limit(1)
      .select("_id text category type")
      .lean();

    const question = nextQuestion[0] ?? null;

    if (!question) {
      return jsonOk({
        status: "completed",
        question: null,
        currentIndex: total,
        total,
      });
    }

    return jsonOk({
      status: "in_progress",
      question: {
        id: question._id.toString(),
        text: question.text,
        category: question.category,
        type: question.type,
      },
      currentIndex: testSession.currentQuestionIndex + 1,
      total,
    });
  } catch (error) {
    logger.error("SESSION_GET_ERROR", error);
    return jsonError("Failed to fetch session question", 500, "server_error");
  }
}
