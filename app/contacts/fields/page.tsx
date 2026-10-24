
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getContactFields } from "@/app/features/contacts/queries/list-contact-fields";
import { ContactFieldsPage } from "@/app/features/contacts/components/contact-fields-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const fields = await getContactFields();

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Back to contacts
        </Link>

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Contact fields
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Configure the information OPTR tracks for each contact and extracts
            from conversations.
          </p>
        </div>

        <div className="mt-8">
          <ContactFieldsPage fields={fields} />
        </div>
      </div>
    </main>
  );
}
