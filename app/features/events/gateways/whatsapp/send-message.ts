type SendWhatsAppMessageParams = {
    to: string;
    text: string;
};

export async function sendWhatsAppMessage({
    to,
    text,
}: SendWhatsAppMessageParams) {
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

    const data = await response.json();

    if (!response.ok) {
        console.error("WhatsApp send failed:", data);
        throw new Error(
            `WhatsApp send failed with status ${response.status}`,
        );
    }

    return data;
}
