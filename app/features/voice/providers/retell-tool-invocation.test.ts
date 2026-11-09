import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { resolveRetellToolInvocationId } from "./retell-tool-invocation";

describe("resolveRetellToolInvocationId", () => {
  const invocation = {
    role: "tool_call_invocation",
    tool_call_id: "tool-123",
    name: "search_data",
    arguments: JSON.stringify({ query: "apartments" }),
  };

  it("resolves a matching tool invocation", () => {
    const result = resolveRetellToolInvocationId({
      call: { transcript_with_tool_calls: [invocation] },
      toolName: "search_data",
      args: { query: "apartments" },
    });

    assert.equal(result, "tool-123");
  });

  it("returns null when transcript is missing", () => {
    const result = resolveRetellToolInvocationId({
      call: {},
      toolName: "search_data",
      args: { query: "apartments" },
    });

    assert.equal(result, null);
  });

  it("returns null when tool name does not match", () => {
    const result = resolveRetellToolInvocationId({
      call: { transcript_with_tool_calls: [invocation] },
      toolName: "list_datasets",
      args: { query: "apartments" },
    });

    assert.equal(result, null);
  });

  it("returns null when arguments do not match", () => {
    const result = resolveRetellToolInvocationId({
      call: { transcript_with_tool_calls: [invocation] },
      toolName: "search_data",
      args: { query: "villas" },
    });

    assert.equal(result, null);
  });

  it("returns null when invocation ID is missing", () => {
    const result = resolveRetellToolInvocationId({
      call: {
        transcript_with_tool_calls: [
          { ...invocation, tool_call_id: undefined },
        ],
      },
      toolName: "search_data",
      args: { query: "apartments" },
    });

    assert.equal(result, null);
  });

  it("resolves the latest matching invocation", () => {
    const result = resolveRetellToolInvocationId({
      call: {
        transcript_with_tool_calls: [
          invocation,
          { ...invocation, tool_call_id: "tool-456" },
        ],
      },
      toolName: "search_data",
      args: { query: "apartments" },
    });

    assert.equal(result, "tool-456");
  });

  it("ignores object property ordering when matching arguments", () => {
  const result = resolveRetellToolInvocationId({
    call: {
      transcript_with_tool_calls: [
        {
          ...invocation,
          arguments: JSON.stringify({
            query: "apartments",
            limit: 10,
          }),
        },
      ],
    },
    toolName: "search_data",
    args: {
      limit: 10,
      query: "apartments",
    },
  });

  assert.equal(result, "tool-123");
});
});