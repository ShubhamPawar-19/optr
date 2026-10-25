
import { listConversations } from "@/app/features/conversations/queries/list-conversations";
import { ConversationsPage } from "@/app/features/conversations/components/conversations-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const conversations = await listConversations();

  return <ConversationsPage conversations={conversations} />;
}
