
import test from "node:test";
import assert from "node:assert/strict";
import { extractWhatsAppStatusUpdates } from "./extract-status-updates.ts";

function createPayload(statuses) {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "business-account-id",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "1234567890",
                phone_number_id: "phone-number-id",
              },
              statuses,
            },
          },
        ],
      },
    ],
  };
}

test("extracts valid delivery status updates", () => {
  const payload = createPayload([
    {
      id: "wamid.sent",
      status: "sent",
      timestamp: "1790000000",
    },
    {
      id: "wamid.delivered",
      status: "delivered",
      timestamp: "1790000001",
    },
    {
      id: "wamid.read",
      status: "read",
      timestamp: "1790000002",
    },
  ]);

  assert.deepEqual(extractWhatsAppStatusUpdates(payload), [
    {
      messageId: "wamid.sent",
      status: "sent",
      timestamp: 1790000000,
    },
    {
      messageId: "wamid.delivered",
      status: "delivered",
      timestamp: 1790000001,
    },
    {
      messageId: "wamid.read",
      status: "read",
      timestamp: 1790000002,
    },
  ]);
});

test("extracts failed status and its error message", () => {
  const payload = createPayload([
    {
      id: "wamid.failed",
      status: "failed",
      timestamp: "1790000003",
      errors: [{ message: "Recipient unavailable" }],
    },
  ]);

  assert.deepEqual(extractWhatsAppStatusUpdates(payload), [
    {
      messageId: "wamid.failed",
      status: "failed",
      timestamp: 1790000003,
      errorMessage: "Recipient unavailable",
    },
  ]);
});

test("ignores unknown statuses and malformed updates", () => {
  const payload = createPayload([
    { id: "wamid.unknown", status: "queued", timestamp: "1790000000" },
    { id: "wamid.bad-time", status: "sent", timestamp: "invalid" },
    { id: "", status: "read", timestamp: "1790000000" },
    { id: "wamid.no-time", status: "delivered" },
  ]);

  assert.deepEqual(extractWhatsAppStatusUpdates(payload), []);
});

test("returns an empty array when there are no status updates", () => {
  assert.deepEqual(
    extractWhatsAppStatusUpdates(createPayload([])),
    [],
  );
});

test("extracts updates from multiple changes", () => {
  const payload = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "business-account-id",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "1234567890",
                phone_number_id: "phone-number-id",
              },
              statuses: [
                {
                  id: "wamid.one",
                  status: "sent",
                  timestamp: "1790000000",
                },
              ],
            },
          },
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "1234567890",
                phone_number_id: "phone-number-id",
              },
              statuses: [
                {
                  id: "wamid.two",
                  status: "delivered",
                  timestamp: "1790000001",
                },
              ],
            },
          },
        ],
      },
    ],
  };

  assert.deepEqual(
    extractWhatsAppStatusUpdates(payload).map((update) => update.messageId),
    ["wamid.one", "wamid.two"],
  );
});
