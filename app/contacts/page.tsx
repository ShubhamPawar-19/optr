import { listContacts } from "@/app/features/contacts/queries/list-contacts";
import { ContactsPage } from "../features/contacts/components/contacts-page";
import { requireCurrentBusiness } from "@/app/lib/current-business";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireCurrentBusiness();

  const contacts = await listContacts();

  return <ContactsPage contacts={contacts} />;
}