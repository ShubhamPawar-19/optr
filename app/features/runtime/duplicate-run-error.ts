
export class DuplicateAgentRunError extends Error {
    constructor() {
        super("An agent run already exists for this event");
        this.name = "DuplicateAgentRunError";
    }
}
