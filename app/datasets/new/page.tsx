import { CreateDatasetPage } from "@/app/features/datasets/components/create-dataset-page";
import { requireCurrentBusiness } from "@/app/lib/current-business";

export default async function Page() {
  await requireCurrentBusiness();

  return <CreateDatasetPage />;
}