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
    title: "Overview",
    items: [
      { title: "Introduction", href: "/docs/overview/introduction" },
      { title: "Architecture", href: "/docs/overview/architecture" },
    ],
  },
  {
    title: "Token (AIC)",
    items: [
      { title: "Tokenomics", href: "/docs/token/tokenomics" },
      { title: "Technical Spec", href: "/docs/token/technical-spec" },
      { title: "Presale Architecture", href: "/docs/token/presale-architecture" },
      { title: "Post-Presale Operations", href: "/docs/token/post-presale-operations" },
      { title: "Deployment Tutorial", href: "/docs/token/deployment-tutorial" },
    ],
  },
  {
    title: "Inference App",
    items: [
      { title: "Overview", href: "/docs/app/overview" },
      { title: "AIC Integration", href: "/docs/app/aic-integration" },
      { title: "AIC in the Inference App", href: "/docs/app/token-economy" },
      { title: "Local Testing", href: "/docs/app/local-testing" },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Pre-Release Checklist", href: "/docs/operations/pre-release" },
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
