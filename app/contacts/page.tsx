import { listContacts } from "@/app/features/contacts/queries/list-contacts";
import { ContactsPage } from "../features/contacts/components/contacts-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const contacts = await listContacts();

  return <ContactsPage contacts={contacts} />;
}