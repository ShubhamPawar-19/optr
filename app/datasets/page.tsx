
import { DatasetsPage } from "@/app/features/datasets/components/datasets-page";
import { listDatasets } from "@/app/features/datasets/queries/list-datasets";
import { requireCurrentBusiness } from "@/app/lib/current-business";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireCurrentBusiness();

  const datasets = await listDatasets();

  return <DatasetsPage datasets={datasets} />;
}
