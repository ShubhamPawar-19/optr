
import { LegalPageLayout } from "@/app/components/legal-page-layout";

export default function DataDeletionPage() {
  return (
    <LegalPageLayout
      title="Data Deletion"
      description="How to request deletion of your OPTR account and associated business information."
    >
      <section>
        <h2>1. Requesting Data Deletion</h2>
        <p>
          If you want to delete your OPTR account or information
          associated with your business workspace, you can submit
          a deletion request to Swaraj Solutions.
        </p>
        <p>
          Send a request through the contact details on our{" "}
          <a href="/contact">Contact page</a>.
        </p>
      </section>

      <section>
        <h2>2. Information to Include</h2>
        <p>Please include:</p>
        <ul>
          <li>The email address associated with your OPTR account.</li>
          <li>Your business or workspace name.</li>
          <li>A clear statement that you are requesting data deletion.</li>
          <li>Any relevant details that help us identify the account.</li>
        </ul>
        <p>
          We may request additional information to verify that
          you are authorized to make the request.
        </p>
      </section>

      <section>
        <h2>3. What May Be Included</h2>
        <p>
          Depending on the verified request and applicable legal
          requirements, deletion may cover account information,
          business workspace information, contacts, leads, datasets,
          conversations, messages, agent execution records and
          associated integration information.
        </p>
      </section>

      <section>
        <h2>4. Third-Party Services</h2>
        <p>
          Some information may also exist with third-party providers
          used by OPTR, such as Meta, Google, Cloudinary, OpenRouter
          and Retell AI.
        </p>
        <p>
          Deletion from OPTR does not automatically establish that
          information has been deleted from those providers. Their
          own deletion procedures and retention policies may apply.
        </p>
        <p>
          For example, removing an image from a dataset record
          removes its URL from that record, but does not itself
          delete the original Cloudinary image.
        </p>
      </section>

      <section>
        <h2>5. Retention and Exceptions</h2>
        <p>
          Some information may need to be retained where required
          by law, for legitimate security purposes, to resolve
          disputes or to maintain necessary business records.
        </p>
        <p>
          Information held in backups or third-party systems may
          also remain for a period under the relevant provider's
          retention practices.
        </p>
      </section>

      <section>
        <h2>6. Request Review</h2>
        <p>
          Deletion requests are handled manually. We will review
          the request, verify authorization where necessary and
          communicate any relevant limitations or additional
          steps.
        </p>
        <p>
          Submitting a request does not mean deletion has already
          taken place. We will communicate the outcome after
          reviewing the request.
        </p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>
          To submit a request, visit our{" "}
          <a href="/contact">Contact page</a> and contact
          Swaraj Solutions.
        </p>
      </section>
    </LegalPageLayout>
  );
}
