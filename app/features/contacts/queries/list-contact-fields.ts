
import "server-only";

import { getCurrentBusiness } from "@/app/lib/current-business";
import { listContactFields } from "../services/contact-fields";

export async function getContactFields() {
  const business = await getCurrentBusiness();

  if (!business) {
    return [];
  }

  return listContactFields(business.id);
}
