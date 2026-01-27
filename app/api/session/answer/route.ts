import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {dbConnect} from "@/lib/db";
import Session from "@/models/Session";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, questionId, answer } = await req.json();

    if (!sessionId || !questionId || !answer) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const testSession = await Session.findById(sessionId);

    if (!testSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    testSession.answers.push({ questionId, answer });
    testSession.currentQuestionIndex += 1;

    await testSession.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
}
