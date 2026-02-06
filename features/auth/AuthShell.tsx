import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { APP_NAME } from "@/lib/constants";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-dvh bg-(--app-bg)">
      <div className="mx-auto grid min-h-dvh max-w-6xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800"
          >
            {APP_NAME}
          </Link>

          <h1 className="mt-4 text-3xl font-semibold text-emerald-950 md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-md text-sm text-emerald-800/80">
            {subtitle}
          </p>

          <Card className="mt-8">
            {children}
          </Card>

          {footer ? (
            <div className="mt-6 text-sm text-emerald-800/80">{footer}</div>
          ) : null}
        </div>

        <aside className="hidden flex-col justify-center space-y-6 lg:flex">
          <Badge>Private Screening</Badge>
          <h2 className="text-2xl font-semibold text-emerald-950">
            A calmer way to check in with yourself.
          </h2>
          <p className="text-sm text-emerald-800/80">
            Your responses stay private, and the experience is designed to feel
            supportive rather than clinical. The results are for awareness only.
          </p>
          <div className="space-y-3 text-sm text-emerald-800/80">
            <p>Personalized screenings with evidence-based scales.</p>
            <p>Clear, respectful language and gentle pacing.</p>
            <p>Built with privacy and safety in mind.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
