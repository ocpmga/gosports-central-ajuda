// ============================================
// GoSports — Chat API Route
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { askClaude } from "@/lib/claude";
import * as driveModule from "@/lib/drive";
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
    .sort((a, b) => b.score - a.score);

  const relevant = scored.filter((item) => item.score > 0);

  if (relevant.length > 0) {
    return relevant.slice(0, limit).map((item) => item.doc);
  }

  // fallback: se nada bater, manda alguns documentos mesmo assim
  return documents.slice(0, Math.min(limit, documents.length));
}

function buildSources(documents: DriveDocument[]) {
  return documents.map((doc) => ({
    name: doc.name,
  }));
}

function sanitizeHistory(
  history: unknown
): { role: "user" | "assistant"; content: string }[] {
  if (!Array.isArray(history)) return [];

  return history
    .filter((msg): msg is { role: unknown; content: unknown } => {
      return typeof msg === "object" && msg !== null;
    })
    .map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: typeof msg.content === "string" ? msg.content.trim() : "",
    }))
    .filter((msg) => msg.content.length > 0)
    .slice(-6);
}

async function loadDriveDocuments(): Promise<DriveDocument[]> {
  // Aceita vários nomes possíveis para evitar erro de import
  const possibleFns = [
    (driveModule as Record<string, unknown>).getDriveDocuments,
    (driveModule as Record<string, unknown>).fetchDriveDocuments,
    (driveModule as Record<string, unknown>).getDocumentsFromDrive,
    (driveModule as Record<string, unknown>).fetchDocumentsFromDrive,
  ];

  const driveFn = possibleFns.find(
    (fn): fn is () => Promise<DriveDocument[]> => typeof fn === "function"
  );

  if (!driveFn) {
    throw new Error(
      "Nenhuma função válida de leitura do Google Drive foi encontrada em lib/drive.ts. Esperado: getDriveDocuments ou fetchDriveDocuments."
    );
  }

  const docs = await driveFn();

  if (!Array.isArray(docs)) {
    throw new Error("A função de leitura do Google Drive não retornou uma lista válida.");
  }

  return docs;
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
    const history = sanitizeHistory(body.history);

    if (!question) {
      return NextResponse.json(
        { error: "Digite uma pergunta antes de enviar." },
        { status: 400 }
      );
    }

    // 1. Buscar documentos do Google Drive
    const allDocuments = await loadDriveDocuments();

    if (!allDocuments.length) {
      const emptyResponse: ChatResponse = {
        answer:
          "Não encontrei materiais de suporte disponíveis no momento. Para mais ajuda, entre em contato com o suporte GoSports.",
        sources: [],
      };

      return NextResponse.json(emptyResponse);
    }

    // 2. Selecionar documentos mais relevantes
    const documentsForClaude = selectRelevantDocuments(question, allDocuments, 5);

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
      const lower = error.message.toLowerCase();

      if (
        error.message.includes("GOOGLE_SERVICE_ACCOUNT") ||
        lower.includes("drive error") ||
        lower.includes("google drive") ||
        lower.includes("service account")
      ) {
        message =
          "Houve um problema ao acessar os materiais de suporte do Google Drive.";
      } else if (
        lower.includes("anthropic") ||
        lower.includes("claude") ||
        lower.includes("api key")
      ) {
        message =
          "Houve um problema ao gerar a resposta com a IA do GoSports.";
      } else if (
        lower.includes("nenhuma função válida de leitura do google drive")
      ) {
        message =
          "A integração com o Google Drive não está configurada corretamente no projeto.";
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
