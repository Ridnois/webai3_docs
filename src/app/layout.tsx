import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "WebAI3 Docs",
    template: "%s — WebAI3 Docs",
  },
  description:
    "Technical and economic documentation for the WebAI3 protocol — AI inference payments, AIC token, presale architecture, and smart contracts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body>
        {children}
      </body>
    </html>
  );
}
