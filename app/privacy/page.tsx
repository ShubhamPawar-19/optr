
import { LegalPageLayout } from "@/app/components/legal-page-layout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="How OPTR collects, uses, stores and shares information when businesses use our platform."
    >
      <section>
        <h2>1. Introduction</h2>
        <p>
          This Privacy Policy explains how Swaraj Solutions, a sole
          proprietorship operating the OPTR platform, collects, uses,
          stores and shares information when you access or use OPTR.
        </p>
        <p>
          OPTR provides AI-powered lead operations and communication
          tools that help businesses respond to inquiries, qualify leads
          and manage customer conversations.
        </p>
        <p>
          By using OPTR, you acknowledge the practices described in
          this policy.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>

        <h3>Account information</h3>
        <p>
          When you create an account, we may collect your name, email
          address, authentication information and account-related
          records.
        </p>

        <h3>Business and workspace information</h3>
        <p>
          We collect business names, agent configurations, instructions,
          settings, datasets, lead information and other information
          that you choose to add to your workspace.
        </p>

        <h3>Communication information</h3>
        <p>
          When you connect communication channels, OPTR may process
          phone numbers, contact details, incoming and outgoing
          messages, message delivery statuses, conversation history
          and related metadata.
        </p>

        <h3>Voice information</h3>
        <p>
          When voice features are used, we may process call metadata,
          phone numbers, transcripts, summaries, call outcomes,
          durations and recording URLs.
        </p>

        <h3>Uploaded content</h3>
        <p>
          Images uploaded to dataset media fields are hosted through
          Cloudinary. Their URLs are stored in the corresponding
          dataset records.
        </p>

        <h3>Technical and usage information</h3>
        <p>
          We may process information associated with platform
          operations, such as agent execution records, tool inputs
          and outputs, timestamps, errors and authentication sessions.
        </p>
      </section>

      <section>
        <h2>3. How We Use Information</h2>
        <p>We use information to:</p>
        <ul>
          <li>Provide and operate the OPTR platform.</li>
          <li>Authenticate users and manage business workspaces.</li>
          <li>Process messages, calls and other communication events.</li>
          <li>Run AI agents and generate responses.</li>
          <li>Maintain contacts, leads, datasets and conversation history.</li>
          <li>Connect supported third-party services.</li>
          <li>Maintain platform security, reliability and troubleshooting.</li>
          <li>Respond to support requests and legal obligations.</li>
        </ul>
      </section>

      <section>
        <h2>4. AI Processing</h2>
        <p>
          OPTR uses third-party AI infrastructure, including OpenRouter,
          to process information and generate AI responses. The model
          used may depend on the configuration selected for the
          relevant agent.
        </p>
        <p>
          Information supplied to an AI agent, including conversation
          content, business instructions and relevant context, may be
          transmitted to the configured AI service for processing.
        </p>
        <p>
          AI-generated outputs may be inaccurate or incomplete.
          Businesses remain responsible for reviewing and deciding
          how to use those outputs.
        </p>
      </section>

      <section>
        <h2>5. Third-Party Services</h2>
        <p>
          OPTR relies on third-party services to provide certain
          features. Depending on which integrations you use, information
          may be processed by:
        </p>
        <ul>
          <li>
            <strong>Meta:</strong> WhatsApp communication and related
            business messaging functionality.
          </li>
          <li>
            <strong>OpenRouter:</strong> AI model access and processing
            of information submitted to configured AI models.
          </li>
          <li>
            <strong>Cloudinary:</strong> Hosting uploaded dataset images.
          </li>
          <li>
            <strong>Retell AI:</strong> Voice calling and related call
            processing, where voice functionality is enabled.
          </li>
          <li>
            <strong>Google:</strong> Google Calendar integration and
            calendar-related operations when connected.
          </li>
          <li>
            <strong>Authentication, database and infrastructure
            providers:</strong> Supporting account authentication,
            data storage and platform operations.
          </li>
        </ul>
        <p>
          These services process information according to their own
          terms and privacy policies. Their handling of information
          may be subject to their respective privacy practices.
        </p>
      </section>

      <section>
        <h2>6. Connected Accounts and Credentials</h2>
        <p>
          When you connect supported integrations, OPTR may process
          access credentials and authorization information required
          to operate those integrations.
        </p>
        <p>
          WhatsApp access tokens and Google Calendar OAuth credentials
          are encrypted by the application before being stored in its
          database.
        </p>
        <p>
          Disconnecting an integration may deactivate its use in OPTR.
          Disconnection does not necessarily delete previously stored
          credentials or revoke authorization with the third-party
          provider.
        </p>
      </section>

      <section>
        <h2>7. Data Storage and Security</h2>
        <p>
          OPTR uses database and infrastructure services to store and
          process account, business and platform information. Uploaded
          dataset images are hosted by Cloudinary.
        </p>
        <p>
          We use technical and organizational safeguards intended to
          protect information against unauthorized access, alteration,
          disclosure or destruction. These include encryption of
          certain integration credentials and access checks for
          business-specific operations.
        </p>
        <p>
          No method of electronic storage or transmission is completely
          secure. We cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>8. Data Retention</h2>
        <p>
          We retain information for as long as reasonably necessary
          to provide the platform, maintain business records, resolve
          disputes, enforce our terms and comply with applicable
          obligations.
        </p>
        <p>
          Retention periods may vary depending on the type of
          information, the feature used and applicable third-party
          service policies.
        </p>
        <p>
          Deactivating a channel or removing an image URL from a
          dataset record does not necessarily delete the underlying
          information from our systems or third-party services.
        </p>
      </section>

      <section>
        <h2>9. Sharing of Information</h2>
        <p>
          We do not sell personal information as a business model.
          We may share information with service providers where
          necessary to operate OPTR, with connected platforms when
          you use their integrations, or where disclosure is
          required by applicable law.
        </p>
      </section>

      <section>
        <h2>10. Your Choices and Requests</h2>
        <p>
          You may contact us to request access, correction or deletion
          of information associated with your account or business,
          subject to applicable law and operational requirements.
        </p>
        <p>
          To submit a deletion request, visit our{" "}
          <a href="/data-deletion">Data Deletion page</a>.
        </p>
      </section>

      <section>
        <h2>11. Children's Privacy</h2>
        <p>
          OPTR is a business-oriented platform and is not intended
          for use by children. We do not knowingly design the service
          to collect personal information directly from children.
        </p>
      </section>

      <section>
        <h2>12. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy when our services,
          practices or legal obligations change. The latest version
          will be published on this page with an updated date.
        </p>
      </section>

      <section>
        <h2>13. Contact</h2>
        <p>
          For privacy-related questions or requests, contact
          Swaraj Solutions through the details on our{" "}
          <a href="/contact">Contact page</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
