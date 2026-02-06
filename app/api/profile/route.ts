import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { jsonError, jsonOk, zodErrorsToFieldMap } from "@/lib/api/response";
import { readJson } from "@/lib/api/parse";
import { logger } from "@/lib/logger";
import { profileUpdateSchema } from "@/lib/validation/schemas";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401, "unauthorized");
  }

  try {
    await dbConnect();

    const user = await User.findById(session.user.id)
      .select("_id name email age gender profileCompleted")
      .lean();

    if (!user) {
      return jsonError("User not found", 404, "not_found");
    }

    return jsonOk({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      age: user.age ?? null,
      gender: user.gender ?? null,
      profileCompleted: user.profileCompleted,
    });
  } catch (error) {
    logger.error("PROFILE_GET_ERROR", error);
    return jsonError("Failed to load profile", 500, "server_error");
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401, "unauthorized");
  }

  const body = await readJson(req);
  if (!body) {
    return jsonError("Invalid JSON payload", 400, "invalid_json");
  }

  const parsed = profileUpdateSchema.safeParse(body);
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

    const updates: Record<string, unknown> = {
      name: parsed.data.name,
      profileCompleted: true,
    };
    const unset: Record<string, unknown> = {};

    if (parsed.data.age !== undefined) {
      if (parsed.data.age === null) {
        unset.age = 1;
      } else {
        updates.age = parsed.data.age;
      }
    }

    if (parsed.data.gender !== undefined) {
      if (parsed.data.gender === null) {
        unset.gender = 1;
      } else {
        updates.gender = parsed.data.gender;
      }
    }

    const updatePayload = {
      ...updates,
      ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
    };

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updatePayload,
      { new: true, runValidators: true }
    )
      .select("_id name email age gender profileCompleted")
      .lean();

    if (!user) {
      return jsonError("User not found", 404, "not_found");
    }

    return jsonOk({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      age: user.age ?? null,
      gender: user.gender ?? null,
      profileCompleted: user.profileCompleted,
    });
  } catch (error) {
    logger.error("PROFILE_UPDATE_ERROR", error);
    return jsonError("Failed to update profile", 500, "server_error");
  }
}
