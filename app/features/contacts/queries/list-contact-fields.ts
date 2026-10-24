
import "server-only";

import { listContactFields } from "../services/contact-fields";

const DEMO_BUSINESS_ID = "demo-business";

export async function getContactFields() {
  return listContactFields(DEMO_BUSINESS_ID);
}
