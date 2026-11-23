
import { getCurrentBusiness } from "@/app/lib/current-business";
import { listLeadFields } from "../services/lead-fields";

export async function getLeadFields() {
  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error("Business not found.");
  }

  return listLeadFields(business.id);
}
