import { listLeads } from "@/app/features/contacts/queries/list-leads";
import { LeadsPage } from "@/app/features/contacts/components/leads-page";
import { requireCurrentBusiness } from "@/app/lib/current-business";

export const dynamic = "force-dynamic";
export default async function Page() {
  await requireCurrentBusiness();

  const { contacts, fields } = await listLeads();
  return <LeadsPage contacts={contacts} fields={fields} />;
}
