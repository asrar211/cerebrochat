import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/features/auth/AuthShell";
import LoginForm from "@/features/auth/LoginForm";

export default async function Login() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Pick up where you left off and review your latest screening."
      footer={
        <span>
          Need an account?{" "}
          <Link href="/register" className="font-semibold text-emerald-800">
            Create one
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
