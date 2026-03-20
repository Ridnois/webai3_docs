import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "WebAI3 Docs",
};

const guides = [
  { title: "What is WebAI3?", href: "/docs/users/introduction", sub: "Platform overview" },
  { title: "The AIC Token", href: "/docs/users/aic-token", sub: "Supply, utility, and distribution" },
  { title: "Presale Guide", href: "/docs/users/presale-guide", sub: "7 phases, pricing, and what you're buying" },
  { title: "Claiming Your Tokens", href: "/docs/users/claiming-tokens", sub: "Vesting schedule and claim flow" },
  { title: "Staking & Discounts", href: "/docs/users/staking-discounts", sub: "Inference rate tiers — coming after TGE" },
  { title: "Using the App", href: "/docs/users/using-the-app", sub: "Wallet connect, inference, payments" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header currentPath="/" />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] text-xs font-mono font-semibold tracking-wider uppercase mb-6">
            WebAI3 Docs
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4 leading-tight">
            Learn how WebAI3 works
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
            Plain-English guides for presale participants, AIC token holders, and inference app users.
          </p>
          <div className="flex items-center gap-3 mt-8">
            <Link
              href="/docs/users/introduction"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold rounded-[var(--radius-md)] hover:opacity-90 transition-opacity"
            >
              Get started
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/docs/users/presale-guide"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--secondary)] transition-colors border border-[var(--border)]"
            >
              Presale guide
            </Link>
          </div>
        </div>

        {/* Guide cards */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--muted)] flex items-center justify-center">
              <FileText size={15} className="text-[var(--foreground)]" />
            </div>
            <h2 className="font-semibold text-[var(--foreground)]">User Guide</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group flex flex-col gap-0.5 p-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] hover:border-[var(--foreground)]/30 hover:bg-[var(--muted)] transition-all duration-200"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-[var(--foreground)] text-sm">{guide.title}</span>
                  <ArrowRight
                    size={12}
                    className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] group-hover:translate-x-0.5 transition-all"
                  />
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">{guide.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
