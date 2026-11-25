
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Capabilities", href: "/#capabilities" },
      { label: "Who it's for", href: "/#who-its-for" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About OPTR", href: "/#who-its-for" },
      { label: "Contact", href: "/contact" },
      { label: "Get started", href: "/signup" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Data Deletion", href: "/data-deletion" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/signup" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-[#e8e4da] bg-[#292923] text-white">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr_1fr]">
          <div className="max-w-[330px]">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-white text-lg font-black tracking-[-0.08em] text-[#292923]">
                o.
              </span>
              <span className="text-xl font-bold tracking-[-0.06em]">
                optr
              </span>
            </Link>

            <p className="mt-5 text-sm leading-7 text-white/60">
              AI-powered lead operations for businesses.
              Respond to inquiries, qualify leads, and manage
              conversations with more context.
            </p>

            <p className="mt-5 text-xs leading-5 text-white/45">
              OPTR is a product of Swaraj Solutions.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                {group.title}
              </h3>

              <ul className="mt-5 space-y-4">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/55 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Swaraj Solutions. All rights reserved.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-1 transition hover:text-white"
          >
            OPTR <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
