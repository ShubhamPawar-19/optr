
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
    readLimitedBody,
    RequestBodyTooLargeError,
} from "./read-limited-body";

describe("readLimitedBody", () => {
    it("reads a request within the size limit", async () => {
        const request = new Request("http://localhost", {
            method: "POST",
            body: JSON.stringify({ hello: "world" }),
        });

        const result = await readLimitedBody(request, 1024);

        assert.equal(result, JSON.stringify({ hello: "world" }));
    });

    it("rejects requests exceeding Content-Length limit", async () => {
        const request = new Request("http://localhost", {
            method: "POST",
            headers: {
                "content-length": "2048",
            },
            body: "small",
        });

        await assert.rejects(
            readLimitedBody(request, 1024),
            RequestBodyTooLargeError,
        );
    });

    it("rejects oversized streamed bodies", async () => {
        const request = new Request("http://localhost", {
            method: "POST",
            body: "x".repeat(2048),
        });

        await assert.rejects(
            readLimitedBody(request, 1024),
            RequestBodyTooLargeError,
        );
    });
});
