import { serve } from "inngest/next";
import { inngest } from "@/app/lib/inngest/client";
import { processWhatsAppMessage } from "@/app/features/events/process-whatsapp-message";
import { recoverStaleOutboundMessages } from "@/app/features/events/recover-stale-outbound-messages";
import { processVoiceCallEvent } from "@/app/features/events/process-voice-call-event";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processWhatsAppMessage,
        recoverStaleOutboundMessages,
        processVoiceCallEvent,
    ],
});