
import { db } from "@/app/lib/db";
import { getCurrentBusiness } from "@/app/lib/current-business";
import { WhatsAppSettings } from "./whatsapp-settings";

export const dynamic = "force-dynamic";

export default async function WhatsAppIntegrationPage() {
  const business = await getCurrentBusiness();

  const channel = business
    ? await db.whatsAppChannel.findFirst({
        where: { businessId: business.id },
        select: {
          phoneNumberId: true,
          isActive: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      })
    : null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-6 md:p-10">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Configuration / Integrations
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          WhatsApp
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Connect your WhatsApp Business number so OPTR can receive inquiries
          and send replies through your AI agent.
        </p>
      </div>

      {!business ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Your workspace could not be found. Sign in with an account associated
          with a business workspace before connecting WhatsApp.
        </div>
      ) : (
        <WhatsAppSettings
          channel={
            channel
              ? {
                  phoneNumberId: channel.phoneNumberId,
                  isActive: channel.isActive,
                  updatedAt: channel.updatedAt.toISOString(),
                }
              : null
          }
        />
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-950">
          Before you connect
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-600">
          <li>
            Open Meta for Developers and select your Meta app with WhatsApp
            Cloud API configured.
          </li>
          <li>
            From WhatsApp API Setup, copy the phone number ID for the number
            you want to connect.
          </li>
          <li>
            Generate a suitable long-lived access token with the required
            WhatsApp Business permissions, including{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
              whatsapp_business_messaging
            </code>
            .
          </li>
          <li>
            Enter both values above. OPTR verifies them with Meta before
            saving the encrypted token.
          </li>
        </ol>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          For production use, configure a suitable system-user token in Meta
          Business settings. Temporary test tokens can expire.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-base font-semibold text-slate-950">
          Webhook configuration
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your Meta app must also point its WhatsApp webhook to your deployed
          OPTR webhook endpoint. Configure the callback URL, verification
          token, and app secret according to your existing deployment
          configuration. Subscribe to the messages webhook field.
        </p>
        <p className="mt-3 break-all rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">
          {process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/webhooks/whatsapp`
            : "/api/webhooks/whatsapp"}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Do not enter your Meta app secret or webhook verification token into
          the access-token field above.
        </p>
      </section>
    </div>
  );
}
