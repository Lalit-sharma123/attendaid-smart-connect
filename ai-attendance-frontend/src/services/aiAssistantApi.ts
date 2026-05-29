import { apiRequest } from "@/lib/api";

export type AiAssistantResponse = {
  reply: string;
  type: string;
  actions?: string[];
  data?: any;
};

export async function askAiAssistantApi(message: string): Promise<AiAssistantResponse> {
  return apiRequest("/ai/assistant/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
