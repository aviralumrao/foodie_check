import { useState } from "react";
import { ArrowUpRight, Menu, ScanLine, X, User } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", id: "navbar-home-link" },
  { label: "History", href: "/history", id: "navbar-history-link" },
  { label: "About", href: "/about", id: "navbar-about-link" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 py-4 z-50  border-emerald-100/80backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10 bg-emerald-700 rounded-full"
        aria-label="Main navigation"
        data-testid="main-navbar"
      >
        <a
          href="#home"
          className="group flex items-center gap-3 text-emerald-950"
          data-testid="navbar-brand-link"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/15 transition-transform duration-200 group-hover:-translate-y-0.5"
            data-testid="navbar-brand-mark"
          >
            <ScanLine size={20} strokeWidth={2.2} aria-hidden="true" />
          </span>

          <span
            className="font-heading text-xl font-black tracking-[-0.04em]"
            data-testid="navbar-brand-name"
          >
            Foodie Check
          </span>
        </a>

        <div
          className="hidden items-center gap-8 md:flex"
          data-testid="navbar-desktop-links"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="text-sm font-semibold text-fuchsia-50 transition-colors duration-200 hover:text-emerald-50"
              data-testid={item.id}
            >
              {item.label}
            </a>
          ))}

          <a
            href={isLoggedIn ? "#profile" : "#login"}
            className="group inline-flex items-center gap-2 rounded-full bg-fuchsia-50 px-5 py-2.5 text-sm font-bold text-emerald-700 shadow-lg shadow-emerald-900/15 transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-xl"
            data-testid="navbar-login-button"
            onClick={() => {
              if (!isLoggedIn) {
                // Handle login navigation
              }
            }}
          >
            {isLoggedIn ? (
              <User size={20} aria-hidden="true" />
            ) : (
              <>
                Login
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </>
            )}
          </a>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 text-emerald-800 transition-colors duration-200 hover:bg-emerald-50 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          data-testid="navbar-mobile-menu-button"
        >
          {menuOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </button>
      </nav>

      {menuOpen && (
        <div
          className="border-t border-emerald-100 bg-white px-6 py-5 md:hidden"
          data-testid="navbar-mobile-menu"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-emerald-900/70 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-700"
                onClick={() => setMenuOpen(false)}
                data-testid={`${item.id}-mobile`}
              >
                {item.label}
              </a>
            ))}

            <a
              href={isLoggedIn ? "#profile" : "#login"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition-transform duration-200 hover:-translate-y-0.5"
              onClick={() => setMenuOpen(false)}
              data-testid="navbar-mobile-login-button"
            >
              {isLoggedIn ? (
                <User size={20} aria-hidden="true" />
              ) : (
                <>
                  Login
                  <ArrowUpRight size={16} aria-hidden="true" />
                </>
              )}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
