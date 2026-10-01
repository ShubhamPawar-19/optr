import { z } from "zod";

import type { OptrTool } from "./types";

export const getCurrentTimeTool: OptrTool = {
    name: "get_current_time",

    description: "Get the current date and time.",

    parameters: z.object({}),

    async execute(_input, _context) {
        return {
            success: true,
            data: {
                iso: new Date().toISOString(),
            },
        };
    },
};