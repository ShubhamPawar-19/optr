import type {
    VoiceProviderEvent,
    VoiceProviderName,
} from "../types";

export interface VerifyVoiceWebhookParams {
    rawBody: string;
    headers: Headers;
}

export interface VoiceProviderAdapter {
    name: VoiceProviderName;

    verifyWebhook(
        params: VerifyVoiceWebhookParams,
    ): Promise<boolean>;

    parseWebhook(
        payload: unknown,
    ): Promise<VoiceProviderEvent | null>;
}