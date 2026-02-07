import { dbConnect } from "@/lib/db";
import Question from "@/models/Question";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { questionInputSchema } from "@/lib/validation/schemas";
import { jsonError, jsonOk, zodErrorsToFieldMap } from "@/lib/api/response";
import { readJson } from "@/lib/api/parse";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // if (!session?.user?.id) {
  //   return jsonError("Unauthorized", 401, "unauthorized");
  // }

  const body = await readJson(req);
  if (!body) {
    return jsonError("Invalid JSON payload", 400, "invalid_json");
  }

  const parsed = questionInputSchema.safeParse(body);
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

    if (Array.isArray(parsed.data)) {
      const questions = await Question.insertMany(parsed.data);
      return jsonOk({ inserted: questions.length }, { status: 201 });
    }

    const question = await Question.create(parsed.data);
    return jsonOk({ id: question._id.toString() }, { status: 201 });
  } catch (error) {
    logger.error("QUESTIONS_POST_ERROR", error);
    return jsonError("Failed to create question", 500, "server_error");
  }
}

export async function GET() {
  try {
    await dbConnect();

    const questions = await Question.find({ isActive: true })
      .sort({ order: 1 })
      .select("_id text category type options")
      .lean();

    return jsonOk(
      questions.map((q) => ({
        id: q._id.toString(),
        text: q.text,
        category: q.category,
        type: q.type,
        options: q.options ?? undefined,
      }))
    );
  } catch (error) {
    logger.error("QUESTIONS_GET_ERROR", error);
    return jsonError("Failed to fetch questions", 500, "server_error");
  }
}
