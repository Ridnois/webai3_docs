import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Coins, Cpu, FileText, Settings } from "lucide-react";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "WebAI3 Docs",
};

const sections = [
  {
    title: "User Guide",
    description:
      "Plain-English guides for presale buyers, token holders, and inference app users.",
    icon: FileText,
    href: "/docs/users/introduction",
    items: ["What is WebAI3?", "AIC Token", "Presale Guide", "Claiming Tokens", "Staking & Discounts", "Using the App"],
  },
  {
    title: "Developer Reference",
    description:
      "Full technical specs for smart contracts, the presale system, fund routing, and the inference payment pipeline.",
    icon: Cpu,
    href: "/docs/developers/architecture",
    items: ["Architecture", "AIC Contract", "Presale System", "Fund Routing", "Token ↔ App", "Inference Pipeline"],
  },
  {
    title: "Token (AIC)",
    description:
      "Tokenomics, governance, presale mechanics, vault policies, and contract deployment.",
    icon: Coins,
    href: "/docs/developers/aic-token-contract",
    items: ["Token Contract", "Presale System", "Fund Routing & Vaults", "Deployment"],
  },
  {
    title: "Operations",
    description:
      "Pre-release checklists, mainnet deployment procedures, and production readiness requirements.",
    icon: Settings,
    href: "/docs/operations/pre-release",
    items: ["Pre-Release Checklist"],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header currentPath="/" />

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] text-xs font-mono font-semibold tracking-wider uppercase mb-6">
            Source of truth
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4 leading-tight">
            WebAI3 Protocol<br />Documentation
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
            Complete technical and economic reference for the WebAI3 platform — covering the AIC
            governance token, presale smart contracts, AI inference payment infrastructure, and
            production deployment.
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
              href="/docs/developers/presale-system"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--secondary)] transition-colors border border-[var(--border)]"
            >
              Presale architecture
            </Link>
          </div>
        </div>

        {/* Section cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.title}
                href={section.href}
                className="group block p-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] hover:border-[var(--foreground)]/30 hover:bg-[var(--muted)] transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--muted)] flex items-center justify-center shrink-0 group-hover:bg-[var(--secondary)] transition-colors">
                    <Icon size={17} className="text-[var(--foreground)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h2 className="font-semibold text-[var(--foreground)] text-[0.9375rem]">
                        {section.title}
                      </h2>
                      <ArrowRight
                        size={13}
                        className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-3">
                      {section.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {section.items.map((item) => (
                        <span
                          key={item}
                          className="text-[0.7rem] px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--muted-foreground)] font-mono"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick links */}
        <div className="mt-16 pt-8 border-t border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Quick reference</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: "Presale phases", href: "/docs/developers/presale-system", sub: "7-phase fund-driven schedule" },
              { label: "Tokenomics", href: "/docs/users/aic-token", sub: "1B AIC fixed supply" },
              { label: "x402 payments", href: "/docs/developers/inference-pipeline", sub: "USDC per inference" },
              { label: "Fund routing & vaults", href: "/docs/developers/fund-routing", sub: "Finalize → liquidity → claims" },
              { label: "Deploy tutorial", href: "/docs/developers/deployment", sub: "Sepolia deployment guide" },
              { label: "AIC staking discounts", href: "/docs/users/staking-discounts", sub: "Inference rate tiers" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col gap-0.5 p-3 rounded-[var(--radius-md)] border border-[var(--border)] hover:border-[var(--foreground)]/25 hover:bg-[var(--muted)] transition-all text-sm"
              >
                <span className="font-medium text-[var(--foreground)]">{link.label}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{link.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
