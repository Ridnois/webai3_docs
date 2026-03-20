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
