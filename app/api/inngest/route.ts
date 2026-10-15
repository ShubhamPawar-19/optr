import { serve } from "inngest/next";
import { inngest } from "@/app/lib/inngest/client";
import { processWhatsAppMessage } from "@/app/features/events/process-whatsapp-message";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [processWhatsAppMessage],
});