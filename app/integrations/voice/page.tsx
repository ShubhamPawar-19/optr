import { requireCurrentBusiness } from "@/app/lib/current-business";
import { db } from "@/app/lib/db";

import { listVoiceChannels } from "@/app/features/voice/queries/list-voice-channels";
import { SidebarToggle } from "@/app/components/sidebar-toggle";
import { VoiceSettings } from "./voice-settings";

export default async function VoiceIntegrationPage() {
    const business = await requireCurrentBusiness();

    const [channels, agents] = await Promise.all([
        listVoiceChannels(),
        db.agent.findMany({
            where: {
                businessId: business.id,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
        }),
    ]);

    return (
        <main className="min-h-dvh flex-1 bg-[#F5F7FB]">
            <header className="sticky top-0 z-20 flex h-[72px] items-center gap-4 border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
                <SidebarToggle />

                <div>
                    <h1 className="text-lg font-semibold text-[#292923]">
                        Voice integration
                    </h1>
                    <p className="text-xs text-slate-500">
                        Configure Retell voice channels for your AI agents.
                    </p>
                </div>
            </header>

            <div className="mx-auto max-w-6xl p-6">
                <VoiceSettings
                    channels={channels}
                    agents={agents}
                />
            </div>
        </main>
    );
}