import { registerVoiceProvider } from "./registry";
import { retellVoiceProvider } from "./retell";

let registered = false;

export function registerVoiceProviders() {
    if (registered) return;

    registerVoiceProvider(retellVoiceProvider);
    registered = true;
}