import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/features/auth/AuthShell";
import RegisterForm from "@/features/auth/RegisterForm";

export default async function Register() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up a private space for check-ins and personalized summaries."
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-800">
            Sign in
          </Link>
        </span>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
