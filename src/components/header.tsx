"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ExternalLink, Menu, X, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation } from "@/lib/docs";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const isDarkStored = localStorage.getItem("theme") !== "light";
    setIsDark(isDarkStored);
    document.documentElement.classList.toggle("dark", isDarkStored);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center justify-center w-8 h-8 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  currentPath: string;
}

function MobileNav({ open, onClose, currentPath }: MobileNavProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 left-0 bottom-0 w-72 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <span className="font-bold text-sm text-[var(--foreground)]">WebAI3</span>
            <span className="text-[0.65rem] font-mono font-semibold px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
              DOCS
            </span>
          </Link>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <p className="section-label mb-2 px-2">{section.title}</p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn("nav-item", currentPath === item.href && "active")}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

interface HeaderProps {
  currentPath: string;
}

export function Header({ currentPath }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
        <div className="flex h-14 items-center px-4 lg:px-6 gap-4">
          {/* Mobile menu button */}
          <button
            className="flex lg:hidden items-center justify-center w-8 h-8 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-6 h-6 rounded-[5px] bg-[var(--foreground)] flex items-center justify-center">
              <span className="text-[var(--background)] text-[0.6rem] font-bold leading-none">W3</span>
            </div>
            <span className="font-semibold text-[0.9rem] text-[var(--foreground)] hidden sm:block">
              WebAI3
            </span>
            <span className="text-[0.625rem] font-mono font-semibold px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)] tracking-wider uppercase hidden sm:block">
              Docs
            </span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right nav */}
          <nav className="flex items-center gap-1">
            <a
              href="https://github.com/Ridnois/webai3_token"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded-md hover:bg-[var(--muted)]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span className="hidden sm:block">GitHub</span>
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        currentPath={currentPath}
      />
    </>
  );
}
