import type { LLMGenerateInput, LLMProvider } from "../provider";

interface GroqChatResponse {
  choices: { message: { role: string; content: string } }[];
}

/**
 * Groq serve modelos open-weight (Llama, etc.) por API gratuita — usado
 * quando não há RAM/CPU suficiente para correr Ollama localmente (ex. VM
 * grátis pequena). O modelo continua open source; só a inferência passa a
 * ser um serviço de terceiros em vez de self-hosted.
 */
export class GroqProvider implements LLMProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async generate({ system, user }: LLMGenerateInput): Promise<string> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(
        `Groq request failed (${res.status}): ${await res.text()}`,
      );
    }

    const data = (await res.json()) as GroqChatResponse;
    return data.choices[0].message.content;
  }
}
