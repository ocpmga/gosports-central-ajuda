// ============================================
// GoSports — Chat API Route
// POST /api/chat
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { fetchDriveDocuments, findRelevantDocuments } from "@/lib/drive";
import { askClaude } from "@/lib/claude";
import { ChatRequest, ChatResponse } from "@/types";

// Vercel timeout — Hobby: 60s, Pro: 300s
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // ── Parse request ──────────────────────────
    const body: ChatRequest = await req.json();
    const { question, history = [] } = body;

    if (!question || typeof question !== "string" || question.trim() === "") {
      return NextResponse.json(
        { error: "Pergunta inválida. Por favor, envie uma pergunta válida." },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim().slice(0, 1000);

    // ── Fetch documents from Google Drive ──────
    let documents: Awaited<ReturnType<typeof fetchDriveDocuments>> = [];
    let usedDrive = true;

    try {
      const allDocs = await fetchDriveDocuments();
      documents = findRelevantDocuments(allDocs, trimmedQuestion);
    } catch (driveError) {
      console.error("Drive error:", driveError);
      usedDrive = false;
      documents = [];
    }

    // ── Ask Claude ─────────────────────────────
    const answer = await askClaude(trimmedQuestion, documents, history);

    const response: ChatResponse = {
      answer,
      sources: documents.map((d) => ({ id: d.id, name: d.name })),
      found: documents.length > 0 && usedDrive,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);

    const message =
      error instanceof Error ? error.message : "Erro desconhecido";

    return NextResponse.json(
      {
        error: `Ocorreu um erro ao processar sua pergunta: ${message}`,
      },
      { status: 500 }
    );
  }
}
