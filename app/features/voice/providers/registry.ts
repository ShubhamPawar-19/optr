import type { VoiceProviderName } from "../types";
import type { VoiceProviderAdapter } from "./types";

const providerRegistry = new Map<
    VoiceProviderName,
    VoiceProviderAdapter
>();

export function registerVoiceProvider(
    provider: VoiceProviderAdapter,
) {
    if (providerRegistry.has(provider.name)) {
        throw new Error(
            `Voice provider "${provider.name}" is already registered`,
        );
    }

    providerRegistry.set(provider.name, provider);
}

export function getVoiceProvider(
    name: VoiceProviderName,
): VoiceProviderAdapter | undefined {
    return providerRegistry.get(name);
}

export function getAllVoiceProviders(): VoiceProviderAdapter[] {
    return Array.from(providerRegistry.values());
}