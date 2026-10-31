
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireCurrentBusiness } from "@/app/lib/current-business";
import { getDataset } from "@/app/features/datasets/queries/get-dataset";
import { CreateRecordForm } from "@/app/features/datasets/components/create-record-form";

interface PageProps {
  params: Promise<{ datasetId: string }>;
}

export const dynamic = "force-dynamic";

export default async function NewRecordPage({ params }: PageProps) {
  await requireCurrentBusiness();

  const { datasetId } = await params;
  const dataset = await getDataset(datasetId);

  if (!dataset) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-[#292923]-950">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <Link
          href={`/datasets/${dataset.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#292923]-500 hover:text-[#292923]-950"
        >
          <ArrowLeft size={16} />
          Back to {dataset.name}
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Add a record
          </h1>
          <p className="mt-2 text-sm text-[#292923]-500">
            Add data to <span className="font-medium text-[#292923]-700">{dataset.name}</span>.
            Fields are generated from this dataset&apos;s schema.
          </p>
        </header>

        <section className="rounded-xl border border-slate-400 bg-white p-6 sm:p-8">
          <CreateRecordForm
            datasetId={dataset.id}
            fields={dataset.fields}
          />
        </section>
      </div>
    </main>
  );
}
