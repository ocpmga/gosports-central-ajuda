// ============================================
// GoSports — Chat API Route
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { askClaude } from "@/lib/claude";
import { getDriveDocuments } from "@/lib/drive";
import { ChatResponse, DriveDocument } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── Helpers ───────────────────────────────────

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function scoreDocument(question: string, doc: DriveDocument): number {
  const questionTokens = tokenize(question);
  const content = normalizeText(`${doc.name} ${doc.content}`);

  let score = 0;

  for (const token of questionTokens) {
    if (content.includes(token)) {
      score += 1;
    }
  }

  // Dá peso extra se o nome do documento tiver termo da pergunta
  const docName = normalizeText(doc.name);
  for (const token of questionTokens) {
    if (docName.includes(token)) {
      score += 2;
    }
  }

  return score;
}

function selectRelevantDocuments(
  question: string,
  documents: DriveDocument[],
  limit = 5
): DriveDocument[] {
  const scored = documents
    .map((doc) => ({
      doc,
      score: scoreDocument(question, doc),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.doc);
}

function buildSources(documents: DriveDocument[]) {
  return documents.map((doc) => ({
    name: doc.name,
  }));
}

// ── POST /api/chat ────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.question !== "string") {
      return NextResponse.json(
        { error: "Pergunta inválida." },
        { status: 400 }
      );
    }

    const question = body.question.trim();
    const history =
      Array.isArray(body.history) && body.history.length > 0
        ? body.history.filter(
            (msg: unknown) =>
              typeof msg === "object" &&
              msg !== null &&
              "role" in msg &&
              "content" in msg
          )
        : [];

    if (!question) {
      return NextResponse.json(
        { error: "Digite uma pergunta antes de enviar." },
        { status: 400 }
      );
    }

    // 1. Buscar documentos do Google Drive
    const allDocuments = await getDriveDocuments();

    if (!allDocuments || allDocuments.length === 0) {
      const emptyResponse: ChatResponse = {
        answer:
          "Não encontrei materiais de suporte disponíveis no momento. Para mais ajuda, entre em contato com o suporte GoSports.",
        sources: [],
      };

      return NextResponse.json(emptyResponse);
    }

    // 2. Selecionar documentos mais relevantes
    const relevantDocuments = selectRelevantDocuments(question, allDocuments, 5);

    // Se nada relevante for encontrado, ainda manda lista vazia pro Claude,
    // para ele usar o fallback correto
    const documentsForClaude =
      relevantDocuments.length > 0 ? relevantDocuments : [];

    // 3. Perguntar ao Claude
    const answer = await askClaude(question, documentsForClaude, history);

    // 4. Responder ao frontend
    const response: ChatResponse = {
      answer,
      sources: buildSources(documentsForClaude),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);

    let message =
      "Ocorreu um erro ao processar sua pergunta. Tente novamente em alguns instantes.";

    if (error instanceof Error) {
      // Erros específicos de Drive
      if (
        error.message.includes("GOOGLE_SERVICE_ACCOUNT") ||
        error.message.toLowerCase().includes("drive error")
      ) {
        message =
          "Houve um problema ao acessar os materiais de suporte do Google Drive.";
      }

      // Erros específicos de Anthropic
      if (
        error.message.toLowerCase().includes("anthropic") ||
        error.message.toLowerCase().includes("claude")
      ) {
        message =
          "Houve um problema ao gerar a resposta com a IA do GoSports.";
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
