import { getAllTools, getTool } from "./registry";

const tool = getTool("get_current_time");

console.log("Tool found:", !!tool);
console.log("All tools:", getAllTools().map((tool) => tool.name));