import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { dbConnect } from "@/lib/db";
import Session from "@/models/Session";
import Question from "@/models/Question";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const testSession = await Session.create({
      userId: session.user.id,
    });

    return NextResponse.json(testSession, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
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

    const question = await Question.findOne({
      isActive: true,
      order: testSession.currentQuestionIndex,
    });

    if (!question) {
      return NextResponse.json({ message: "Test completed" });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}
