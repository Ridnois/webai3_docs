export interface NavItem {
  title: string;
  href: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "User Guide",
    items: [
      { title: "What is WebAI3?", href: "/docs/users/introduction" },
      { title: "The AIC Token", href: "/docs/users/aic-token" },
      { title: "Presale Guide", href: "/docs/users/presale-guide" },
      { title: "Claiming Your Tokens", href: "/docs/users/claiming-tokens" },
      { title: "Staking & Discounts", href: "/docs/users/staking-discounts" },
      { title: "Using the App", href: "/docs/users/using-the-app" },
    ],
  },
  {
    title: "Developer Reference",
    items: [
      { title: "System Architecture", href: "/docs/developers/architecture" },
      { title: "AIC Token Contract", href: "/docs/developers/aic-token-contract" },
      { title: "Presale System", href: "/docs/developers/presale-system" },
      { title: "Fund Routing & Vaults", href: "/docs/developers/fund-routing" },
      { title: "Token ↔ App Integration", href: "/docs/developers/token-app-integration" },
      { title: "Inference Payment Pipeline", href: "/docs/developers/inference-pipeline" },
      { title: "Local Development", href: "/docs/developers/local-development" },
      { title: "Contract Deployment", href: "/docs/developers/deployment" },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Pre-Release Checklist", href: "/docs/operations/pre-release" },
    ],
  },
  {
    title: "Devlog",
    items: [
      { title: "Landing App Overhaul — Mar 2026", href: "/docs/devlog/landing-overhaul-mar-2026" },
      { title: "Fix Plan: Hardcoded Prices", href: "/docs/devlog/hardcoded-prices-fix" },
      { title: "Landing: Prices Fix & Live Phase", href: "/docs/devlog/landing-live-phase-mar-2026" },
    ],
  },
];

export function extractToc(html: string): { id: string; text: string; level: number }[] {
  const headingRegex = /<h([23])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi;
  const toc: { id: string; text: string; level: number }[] = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const id = match[2];
    const text = match[3].replace(/<[^>]+>/g, "");
    toc.push({ id, text, level });
  }
  return toc;
}
