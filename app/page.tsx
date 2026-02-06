import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { APP_NAME, APP_DISCLAIMER, APP_TAGLINE } from "@/lib/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CircleUserRound, Link } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <div className="min-h-dvh bg-(--app-bg)">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-800">
          {APP_NAME}
        </div>
        <div className="flex items-center gap-3">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Sign in
          </ButtonLink>
          {session && 
          <ButtonLink
            href="/profile"
            className="absolute right-4 top-4 rounded-full border border-emerald-100 bg-white p-2 shadow-sm"
            aria-label="View profile"
          >
          <CircleUserRound className="h-8 w-5 text-emerald-700" />
          </ButtonLink>}
          <ButtonLink href="/register" variant="secondary" size="sm">
            Create account
          </ButtonLink>
          
        </div>
      </nav>

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center">
          <Badge>Private screening</Badge>
          <h1 className="mt-6 text-4xl font-semibold text-emerald-950 md:text-5xl">
            A calmer, clearer mental health check-in
          </h1>
          <p className="mt-4 max-w-xl text-base text-emerald-800/80">
            {APP_TAGLINE} Answer a short series of questions and receive a
            thoughtful summary grounded in evidence-based screening tools.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/login" size="lg">
              Start screening
            </ButtonLink>
            <ButtonLink href="/register" variant="ghost" size="lg">
              New here? Create an account
            </ButtonLink>
          </div>
          <p className="mt-6 text-xs text-emerald-700/70">{APP_DISCLAIMER}</p>
        </section>

        <section className="flex flex-col justify-center">
          <Card className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-emerald-950">
                What you can expect
              </h2>
              <p className="mt-2 text-sm text-emerald-800/80">
                Designed for clarity, comfort, and momentum.
              </p>
            </div>
            <div className="grid gap-4 text-sm text-emerald-800/80">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                5 minutes or less, with gentle pacing and no judgment.
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                Screenings based on PHQ-9, GAD-7, and related tools.
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                Results you can revisit and share with a professional.
              </div>
            </div>
          </Card>
        </section>
      </main>

      <section className="mx-auto w-full max-w-6xl px-6 pb-12">
        <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-emerald-950">
              Build a healthier check-in habit
            </h3>
            <p className="mt-2 text-sm text-emerald-800/80">
              Use CerebroChat as a private reflection tool between sessions or
              whenever you want a grounded summary.
            </p>
          </div>
          <ButtonLink href="/login">Continue</ButtonLink>
        </Card>
      </section>
    </div>
  );
}
