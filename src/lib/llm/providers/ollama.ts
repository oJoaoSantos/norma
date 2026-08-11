import type { LLMGenerateInput, LLMProvider } from "../provider";

interface OllamaChatResponse {
  message: { role: string; content: string };
}

export class OllamaProvider implements LLMProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly model: string,
  ) {}

  async generate({ system, user }: LLMGenerateInput): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(
        `Ollama request failed (${res.status}): ${await res.text()}`,
      );
    }

    const data = (await res.json()) as OllamaChatResponse;
    return data.message.content;
  }
}
