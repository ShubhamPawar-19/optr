import { listLeads } from "@/app/features/contacts/queries/list-leads";
import { LeadsPage } from "@/app/features/contacts/components/leads-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { contacts, fields } = await listLeads();

  return <LeadsPage contacts={contacts} fields={fields} />;
}
