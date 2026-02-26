import { Agent } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { createOpenAI } from "@ai-sdk/openai";

export const generateGreeting = new Agent(components.agent, {
  chat: createOpenAI({baseURL: "https://api.openai.com/v1"}).chat("ft:gpt-4.1-mini-2025-04-14:personal::DDCN4opH"),
  
});