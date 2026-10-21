
import { DatasetsPage } from "@/app/features/datasets/components/datasets-page";
import { listDatasets } from "@/app/features/datasets/queries/list-datasets";

export const dynamic = "force-dynamic";

export default async function Page() {
  const datasets = await listDatasets();

  return <DatasetsPage datasets={datasets} />;
}
