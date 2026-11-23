
import { requireCurrentBusiness } from "@/app/lib/current-business";
import { getLeadFields } from "@/app/features/leads/queries/list-lead-fields";
import { LeadFieldsPage } from "@/app/features/leads/components/lead-fields-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireCurrentBusiness();

  const fields = await getLeadFields();

  return <LeadFieldsPage fields={fields} />;
}
