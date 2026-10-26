type SendWhatsAppMessageParams = {
    to: string;
    text: string;
};

type WhatsAppSendResponse = {
    messages: Array<{
        id: string;
    }>;
};

export async function sendWhatsAppMessage({
    to,
    text,
}: SendWhatsAppMessageParams): Promise<WhatsAppSendResponse> {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
        throw new Error("WhatsApp credentials are not configured");
    }

    const response = await fetch(
        `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "text",
                text: {
                    preview_url: false,
                    body: text,
                },
            }),
        },
    );

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        console.error("WhatsApp send failed:", {
            status: response.status,
            data,
        });

        throw new Error(
            `WhatsApp send failed with status ${response.status}`,
        );
    }

    if (
        typeof data !== "object" ||
        data === null ||
        !("messages" in data) ||
        !Array.isArray(data.messages) ||
        typeof data.messages[0] !== "object" ||
        data.messages[0] === null ||
        !("id" in data.messages[0]) ||
        typeof data.messages[0].id !== "string" ||
        !data.messages[0].id.trim()
    ) {
        throw new Error(
            "WhatsApp returned a successful response without a valid message ID",
        );
    }

    return {
        messages: [{ id: data.messages[0].id }],
    };
}
