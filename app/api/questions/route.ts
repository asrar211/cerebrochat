import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Question from "@/models/Question";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { text, category, order, type } = await req.json();

    if (!text || !category || order === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const question = await Question.create({
      text,
      category,
      order,
      type,
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
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
