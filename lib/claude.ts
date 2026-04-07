// ============================================
// GoSports — Claude AI Integration
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import { DriveDocument } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Helpers ───────────────────────────────────

function truncateContent(content: string, maxLength = 3000): string {
  if (!content) return "";
  return content.length > maxLength
    ? `${content.slice(0, maxLength)}...`
    : content;
}

function extractLinksFromDocuments(documents: DriveDocument[]) {
  const allText = documents.map((doc) => doc.content || "").join("\n\n");
  const urls = allText.match(/https?:\/\/[^\s)]+/g) || [];

  const videoLink =
    urls.find((url) => url.includes("youtube.com")) ||
    urls.find((url) => url.includes("youtu.be")) ||
    urls.find((url) => url.includes("drive.google.com"));

  const pdfLink =
    urls.find((url) => url.includes(".pdf")) ||
    urls.find((url) => url.includes("drive.google.com"));

  return {
    videoLink,
    pdfLink,
  };
}

function buildContext(documents: DriveDocument[]): string {
  return documents
    .map((doc, index) => {
      const content = truncateContent(doc.content, 3000);
      return `--- Documento ${index + 1}: ${doc.name} ---\n${content}`;
    })
    .join("\n\n");
}

// ── Build system prompt ───────────────────────
function buildSystemPrompt(documents: DriveDocument[]): string {
  if (documents.length === 0) {
    return `
Você é o assistente virtual oficial da Central de Ajuda GoSports.

Regras:
- Responda sempre em português do Brasil
- Seja claro, profissional, objetivo e prestativo
- Use linguagem simples, como um suporte real de aplicativo
- Não invente informações
- Como não há documentos relevantes disponíveis para esta pergunta, informe isso com clareza

Formato esperado:
1. Resposta direta
2. Se necessário, orientação breve
3. Encerrar sugerindo suporte

Resposta padrão quando não houver base:
"Não encontrei essa informação nos meus materiais de suporte no momento. Para receber ajuda mais específica, entre em contato com o suporte GoSports."
`;
  }

  const context = buildContext(documents);

  return `
Você é o assistente virtual oficial da Central de Ajuda GoSports, um aplicativo de reservas esportivas.

Seu papel é responder como um suporte profissional, claro e confiável.

## Regras obrigatórias
- Responda SEMPRE em português do Brasil
- Seja objetivo, educado, profissional e natural
- Use APENAS as informações dos documentos fornecidos
- Não invente, não suponha e não complete com conhecimento externo
- Se a resposta não estiver claramente nos documentos, diga isso
- Priorize respostas úteis para usuários comuns
- Quando fizer sentido, organize a resposta em:
  - resposta direta
  - passo a passo
  - possíveis problemas
  - o que fazer se não funcionar
- Não use linguagem muito técnica
- Não fale que está "analisando documentos"
- Não diga "de acordo com o documento 1" ou "documento 2"
- Não exponha estrutura interna da base

## Estilo de resposta
A resposta deve parecer um suporte real de aplicativo:
- clara
- curta, mas completa
- prática
- sem enrolação
- com instruções acionáveis

## Quando houver pouca informação
Se houver informação parcial, diga o que foi encontrado e deixe claro o limite.
Exemplo:
"Encontrei uma orientação parcial sobre isso. O procedimento indicado é..."

## Quando não houver informação suficiente
Use exatamente esta frase:
"Não encontrei essa informação nos meus materiais de suporte. Para mais ajuda, entre em contato com o suporte GoSports."

## Uso de links
Se houver links úteis nos documentos, você PODE mencioná-los ao final como:
- Vídeo: <link>
- Guia completo: <link>

## Base de conhecimento disponível
${context}

## Instrução final
Responda apenas com base nos documentos acima.
`;
}

// ── Main: ask Claude ──────────────────────────
export async function askClaude(
  question: string,
  documents: DriveDocument[],
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  const systemPrompt = buildSystemPrompt(documents);
  const recentHistory = history.slice(-6);

  const messages: Anthropic.MessageParam[] = [
    ...recentHistory.map((msg) => ({
      role: msg.role,
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

  let finalAnswer = textBlock.text.trim();

  // Adiciona links úteis, se existirem nos documentos
  const { videoLink, pdfLink } = extractLinksFromDocuments(documents);

  const linksToAppend: string[] = [];

  if (videoLink && !finalAnswer.includes(videoLink)) {
    linksToAppend.push(`🎥 Vídeo: ${videoLink}`);
  }

  if (pdfLink && !finalAnswer.includes(pdfLink) && pdfLink !== videoLink) {
    linksToAppend.push(`📄 Guia completo: ${pdfLink}`);
  }

  if (linksToAppend.length > 0) {
    finalAnswer += `\n\n${linksToAppend.join("\n")}`;
  }

  return finalAnswer;
}
