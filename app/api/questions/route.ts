import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Question from "@/models/Question";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  await dbConnect();

  if (Array.isArray(body)) {
    await Question.deleteMany({});
    const questions = await Question.insertMany(body);
    return NextResponse.json(
      { inserted: questions.length },
      { status: 201 }
    );
  }

  const question = await Question.create(body);
  return NextResponse.json(question, { status: 201 });
}


export async function GET() {
  try {
    await dbConnect();

    const questions = await Question.find({ isActive: true })
      .sort({ order: 1 })
      .select("_id text category type");

    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
