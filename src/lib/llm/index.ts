import type { LLMProvider } from "./provider";
import { GroqProvider } from "./providers/groq";
import { OllamaProvider } from "./providers/ollama";

export type { LLMProvider, LLMGenerateInput } from "./provider";

let provider: LLMProvider | null = null;

export function getProvider(): LLMProvider {
  if (provider) return provider;

  const name = process.env.LLM_PROVIDER ?? "ollama";

  switch (name) {
    case "ollama":
      provider = new OllamaProvider(
        process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
        process.env.OLLAMA_MODEL ?? "llama3.1:8b",
      );
      break;
    case "groq": {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error("GROQ_API_KEY não definido");
      provider = new GroqProvider(
        apiKey,
        process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      );
      break;
    }
    default:
      throw new Error(`LLM_PROVIDER desconhecido: "${name}"`);
  }

  return provider;
}
