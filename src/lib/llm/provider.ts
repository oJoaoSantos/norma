export interface LLMGenerateInput {
  system: string;
  user: string;
}

export interface LLMProvider {
  generate(input: LLMGenerateInput): Promise<string>;
}
