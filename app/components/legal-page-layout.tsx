
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { PublicFooter } from "@/app/components/public-footer";

interface LegalPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function LegalPageLayout({
  title,
  description,
  children,
}: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f8f7f3] text-[#292923]">
      <div className="mx-auto max-w-[900px] px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#292923]/60 transition hover:text-[#292923]"
        >
          <ArrowLeft size={16} />
          Back to OPTR
        </Link>

        <header className="mt-12 border-b border-[#e8e4da] pb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#77745f]">
            OPTR · Swaraj Solutions
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {title}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-[#292923]/60">
            {description}
          </p>

          <p className="mt-5 text-xs text-[#292923]/45">
            Last updated: November 25, 2026
          </p>
        </header>

        <article className="legal-content py-10">
          {children}
        </article>

        <div className="mt-12 border-t border-[#e8e4da] pt-6 text-sm text-[#292923]/55">
          Questions about this page?{" "}
          <Link href="/contact" className="font-medium underline underline-offset-4">
            Contact Swaraj Solutions
          </Link>.
        </div>
      </div>

      <PublicFooter />
    </main>
  );
}
