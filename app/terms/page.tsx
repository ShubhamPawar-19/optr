
import { LegalPageLayout } from "@/app/components/legal-page-layout";

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      description="The terms governing access to and use of the OPTR platform."
    >
      <section>
        <h2>1. Agreement</h2>
        <p>
          These Terms of Service govern your access to and use of OPTR,
          a software platform operated by Swaraj Solutions, a sole
          proprietorship.
        </p>
        <p>
          By creating an account or using OPTR, you agree to these
          terms. If you do not agree, do not use the platform.
        </p>
      </section>

      <section>
        <h2>2. The Service</h2>
        <p>
          OPTR provides AI-powered tools for business communication,
          lead management, automation and related operations. Features
          may include AI agents, WhatsApp integrations, voice
          integrations, datasets, contact management and calendar
          connectivity.
        </p>
        <p>
          Features may change, be modified or become unavailable as
          the platform develops.
        </p>
      </section>

      <section>
        <h2>3. Accounts and Access</h2>
        <p>
          You are responsible for providing accurate account
          information, maintaining the confidentiality of your
          credentials and activities performed through your account.
        </p>
        <p>
          You must notify us if you believe your account has been
          accessed without authorization.
        </p>
      </section>

      <section>
        <h2>4. Acceptable Use</h2>
        <p>You agree not to use OPTR to:</p>
        <ul>
          <li>Violate applicable laws or regulations.</li>
          <li>Send unlawful, deceptive, abusive or unauthorized communications.</li>
          <li>Violate the privacy or rights of other individuals.</li>
          <li>Distribute malware or attempt to compromise the platform.</li>
          <li>Access another user's account or business data without authorization.</li>
          <li>Abuse third-party services or violate their applicable terms.</li>
          <li>Interfere with the availability or security of OPTR.</li>
        </ul>
      </section>

      <section>
        <h2>5. Your Business Responsibilities</h2>
        <p>
          You are responsible for the data you upload, the contacts
          you communicate with, the permissions you obtain and the
          instructions you configure for your agents.
        </p>
        <p>
          You must ensure that your use of OPTR and connected
          communication channels complies with applicable privacy,
          consumer protection, messaging and telecommunication
          requirements.
        </p>
        <p>
          You are responsible for obtaining any required consent
          before sending communications or processing another
          person's information.
        </p>
      </section>

      <section>
        <h2>6. AI-Generated Content</h2>
        <p>
          OPTR may use AI systems to generate responses, summaries,
          classifications and other outputs. AI outputs may be
          inaccurate, incomplete or inappropriate for a particular
          situation.
        </p>
        <p>
          You are responsible for reviewing AI-generated content
          and determining whether it is appropriate before relying
          on it or using it in communications with customers.
        </p>
        <p>
          OPTR does not guarantee that AI agents will always respond
          correctly, be available continuously or achieve a
          particular business outcome.
        </p>
      </section>

      <section>
        <h2>7. Third-Party Integrations</h2>
        <p>
          OPTR may connect with third-party services, including
          Meta, WhatsApp, Google, Cloudinary, OpenRouter and
          Retell AI.
        </p>
        <p>
          Your use of those services may be governed by separate
          terms, policies, permissions and technical limitations.
          Swaraj Solutions does not control the availability or
          operation of third-party platforms.
        </p>
      </section>

      <section>
        <h2>8. Data and Content</h2>
        <p>
          You retain responsibility for the information and content
          you submit to OPTR. You authorize us to process that
          information as necessary to provide the service and
          perform the operations you request.
        </p>
        <p>
          You must have the necessary rights and permissions to
          upload or process the information you provide.
        </p>
      </section>

      <section>
        <h2>9. Service Availability</h2>
        <p>
          We aim to maintain a reliable service but do not guarantee
          uninterrupted or error-free availability. The platform
          may experience maintenance, outages, delays or changes
          resulting from technical issues or third-party services.
        </p>
      </section>

      <section>
        <h2>10. Suspension and Termination</h2>
        <p>
          We may restrict or suspend access where reasonably
          necessary to protect the platform, comply with legal
          obligations, address misuse or respond to security risks.
        </p>
        <p>
          You may stop using OPTR and contact us regarding your
          account and associated data through our{" "}
          <a href="/data-deletion">Data Deletion page</a>.
        </p>
      </section>

      <section>
        <h2>11. Disclaimer</h2>
        <p>
          To the extent permitted by applicable law, OPTR is
          provided on an as-available basis. We do not warrant
          that the platform will meet every business requirement
          or that AI outputs, integrations or third-party services
          will be error-free.
        </p>
      </section>

      <section>
        <h2>12. Limitation of Liability</h2>
        <p>
          To the extent permitted by applicable law, Swaraj
          Solutions will not be liable for indirect, incidental
          or consequential losses arising from the use of OPTR,
          including losses caused by third-party service
          interruptions or reliance on AI-generated outputs.
        </p>
        <p>
          Nothing in these terms excludes liability that cannot
          lawfully be excluded under applicable law.
        </p>
      </section>

      <section>
        <h2>13. Changes to These Terms</h2>
        <p>
          We may update these terms as the platform evolves.
          Updated terms will be published on this page with
          a revised date.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>
          Questions about these terms can be sent through our{" "}
          <a href="/contact">Contact page</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
