import { ArrowUpRight, ScanLine } from "lucide-react";

const footerLinks = [
{ label: "Home", href: "#home", id: "footer-home-link" },
{
label: "How it works",
href: "#how-it-works",
id: "footer-how-it-works-link",
},
{ label: "Security", href: "#security", id: "footer-security-link" },
];

export default function Footer() {
return (
<footer className="bg-emerald-950 px-6 py-16 text-emerald-50 sm:py-20 lg:px-10" data-testid="main-footer">
  <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.3fr_0.7fr_0.8fr]">
    <div>
      <a href="#home" className="mb-5 inline-flex items-center gap-3" data-testid="footer-brand-link">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 text-emerald-950"
          data-testid="footer-brand-mark">
          <ScanLine size={20} aria-hidden="true" />
        </span>

        <span className="font-heading text-xl font-black tracking-[-0.04em]" data-testid="footer-brand-name">
          Foodie Check
        </span>
      </a>

      <p className="max-w-sm text-sm leading-7 text-emerald-100/60" data-testid="footer-description">
        A calmer way to understand what is in the food you bring home.
        Simple, private, and ready when you are.
      </p>
    </div>

    <div>
      <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300"
        data-testid="footer-links-heading">
        Explore
      </h2>

      <div className="flex flex-col items-start gap-3">
        {footerLinks.map((item) => (
        <a key={item.id} href={item.href}
          className="group inline-flex items-center gap-1 text-sm text-emerald-100/65 transition-colors duration-200 hover:text-white"
          data-testid={item.id}>
          {item.label}

          <ArrowUpRight size={13} className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            aria-hidden="true" />
        </a>
        ))}
      </div>
    </div>

    <div>
      <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300"
        data-testid="footer-contact-heading">
        Stay curious
      </h2>

      <p className="mb-4 text-sm leading-6 text-emerald-100/60" data-testid="footer-contact-copy">
        Questions, ideas, or just want to say hello?
      </p>

      <a href="mailto:hello@foodiecheck.app"
        className="text-sm font-bold text-emerald-300 transition-colors duration-200 hover:text-white"
        data-testid="footer-email-link">
        hello@foodiecheck.app
      </a>
    </div>
  </div>

  <div
    className="mx-auto mt-14 flex max-w-7xl flex-col gap-3 border-t border-emerald-800/70 pt-6 text-xs text-emerald-100/40 sm:flex-row sm:items-center sm:justify-between"
    data-testid="footer-bottom-bar">
    <span data-testid="footer-copyright">
      © 2024 Foodie Check. Built for simple choices.
    </span>

    <span data-testid="footer-static-note">
      A static demo experience
    </span>
  </div>
</footer>
);
}