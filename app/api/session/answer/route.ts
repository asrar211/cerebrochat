import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import {dbConnect} from "@/lib/db";
import Session from "@/models/Session";
import { ScaleOption } from "@/lib/scale";

export async function POST(req: Request) {
  const authSession = await getServerSession(authOptions);

  if (!authSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, questionId, option } = await req.json();

  if (!sessionId || !questionId || !option) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!Object.values(ScaleOption).includes(option)) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  await dbConnect();

  const session = await Session.findById(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  session.answers.push({ questionId, option });
  session.currentQuestionIndex += 1;

  await session.save();

  return NextResponse.json({ success: true });
}
