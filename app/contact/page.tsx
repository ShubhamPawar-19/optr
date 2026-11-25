
import Link from "next/link";
import { LegalPageLayout } from "@/app/components/legal-page-layout";

export default function ContactPage() {
  return (
    <LegalPageLayout
      title="Contact Us"
      description="Get in touch with the team behind OPTR for product, account and privacy-related questions."
    >
      <section>
        <h2>OPTR Support</h2>
        <p>
          For product questions, technical support, account
          assistance or integration-related issues, contact
          Swaraj Solutions.
        </p>
      </section>

      <section>
        <h2>Business Information</h2>
        <div className="rounded-xl border border-[#e8e4da] bg-white p-6">
          <p className="text-sm text-[#292923]/50">Product</p>
          <p className="mt-1 font-semibold">OPTR</p>

          <p className="mt-5 text-sm text-[#292923]/50">Business operator</p>
          <p className="mt-1 font-semibold">Swaraj Solutions</p>

          <p className="mt-5 text-sm text-[#292923]/50">Business structure</p>
          <p className="mt-1 font-semibold">Sole Proprietorship</p>

          <p className="mt-5 text-sm text-[#292923]/50">Support email</p>
          <p className="mt-1 font-semibold">
            [Add your public support email before publishing]
          </p>
        </div>
      </section>

      <section>
        <h2>Privacy and Data Requests</h2>
        <p>
          For questions about personal information or requests
          to access, correct or delete information, please
          review our{" "}
          <Link href="/privacy">Privacy Policy</Link> and{" "}
          <Link href="/data-deletion">Data Deletion page</Link>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
