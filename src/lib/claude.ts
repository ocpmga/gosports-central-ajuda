// ============================================
// GoSports — Claude AI Integration
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import { DriveDocument } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Build system prompt ───────────────────────
function buildSystemPrompt(documents: DriveDocument[]): string {
  if (documents.length === 0) {
    return `Você é o assistente virtual da Central de Ajuda GoSports.
Responda sempre em português brasileiro, de forma clara, direta e amigável.
Não foram encontrados documentos relevantes para esta pergunta.
Informe ao usuário que não encontrou a informação e sugira que entre em contato com o suporte GoSports.`;
  }

  const context = documents
    .map(
      (doc, i) =>
        `--- Documento ${i + 1}: ${doc.name} ---\n${doc.content.slice(0, 3000)}`
    )
    .join("\n\n");

  return `Você é o assistente virtual da Central de Ajuda GoSports — um aplicativo de reserva de quadras esportivas.

## Suas regras:
- Responda SEMPRE em português brasileiro
- Seja claro, direto e amigável
- Use APENAS as informações dos documentos fornecidos abaixo
- Não invente informações que não estejam nos documentos
- Se a resposta não estiver nos documentos, diga isso claramente e sugira contato com o suporte
- Use formatação com markdown quando ajudar (listas, negrito)
- Mantenha respostas concisas mas completas

## Base de conhecimento disponível:

${context}

## Instrução final:
Responda apenas com base nos documentos acima. Se não encontrar a informação, diga: "Não encontrei essa informação nos meus materiais de suporte. Para mais ajuda, entre em contato com o suporte GoSports."`;
}

// ── Main: ask Claude ──────────────────────────
export async function askClaude(
  question: string,
  documents: DriveDocument[],
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  const systemPrompt = buildSystemPrompt(documents);

  // Build message history (last 6 turns for context window efficiency)
  const recentHistory = history.slice(-6);

  const messages: Anthropic.MessageParam[] = [
    ...recentHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    {
      role: "user",
      content: question,
    },
  ];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textBlock.text;
}
