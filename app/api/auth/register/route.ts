import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validation/schemas";
import { jsonError, jsonOk, zodErrorsToFieldMap } from "@/lib/api/response";
import { readJson } from "@/lib/api/parse";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) {
    return jsonError("Invalid JSON payload", 400, "invalid_json");
  }

  const parsed = registerSchema.safeParse(body);
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

    const { email, name, password } = parsed.data;

    const exists = await User.findOne({ email }).select("_id").lean();
    if (exists) {
      return jsonError("Email already in use", 409, "conflict");
    }

    const user = await User.create({
      email,
      name,
      password,
    });

    return jsonOk({ userId: user._id.toString() }, { status: 201 });
  } catch (error) {
    logger.error("REGISTER_ERROR", error);
    return jsonError("Internal server error", 500, "server_error");
  }
}
