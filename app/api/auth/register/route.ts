import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    await User.create({
      email,
      name,
      password,
    });

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
