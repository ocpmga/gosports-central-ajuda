// ============================================
// GoSports — Google Drive Integration
// ============================================

import { google, drive_v3 } from "googleapis";
import { DriveDocument } from "@/types";

// ── Auth ──────────────────────────────────────

function getGoogleCredentials() {
  const raw =
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!raw) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set."
    );
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON. Make sure the full service account JSON is stored correctly in Vercel."
    );
  }
}

function getGoogleAuth() {
  const credentials = getGoogleCredentials();

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

async function getDriveClient() {
  const auth = getGoogleAuth();
  return google.drive({ version: "v3", auth });
}

// ── Helpers ───────────────────────────────────

function getFolderId(): string {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID environment variable is not set.");
  }

  return folderId;
}

function normalizeString(value: string | null | undefined): string {
  return value ?? "";
}

function buildDriveFileUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

function buildGoogleDocUrl(fileId: string): string {
  return `https://docs.google.com/document/d/${fileId}/edit`;
}

// ── List files in folder ──────────────────────

async function listFilesInFolder(): Promise<
  { id: string; name: string; mimeType: string }[]
> {
  const drive = await getDriveClient();
  const folderId = getFolderId();

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id,name,mimeType)",
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return (res.data.files || [])
    .filter((file) => file.id && file.name && file.mimeType)
    .map((file) => ({
      id: file.id || "",
      name: file.name || "",
      mimeType: file.mimeType || "",
    }));
}

// ── Read Google Doc content ───────────────────

async function extractGoogleDocText(fileId: string): Promise<string> {
  const drive = await getDriveClient();

  const res = await drive.files.export(
    {
      fileId,
      mimeType: "text/plain",
      supportsAllDrives: true,
    },
    {
      responseType: "text",
    }
  );

  return typeof res.data === "string" ? res.data : "";
}

// ── Read text/plain file ──────────────────────

async function extractPlainTextFile(fileId: string): Promise<string> {
  const drive = await getDriveClient();

  const res = await drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    {
      responseType: "text",
    }
  );

  return typeof res.data === "string" ? res.data : "";
}

// ── Build doc fallback for non-text files ─────

function buildFallbackContent(file: {
  id: string;
  name: string;
  mimeType: string;
}): string {
  const lowerName = file.name.toLowerCase();

  if (file.mimeType === "application/pdf" || lowerName.endsWith(".pdf")) {
    return `Documento PDF disponível: ${file.name}
Link: ${buildDriveFileUrl(file.id)}
Resumo: Este arquivo está armazenado como PDF no Google Drive. Consulte o documento pelo link acima.`;
  }

  if (lowerName.includes("video") || file.mimeType.startsWith("video/")) {
    return `Vídeo disponível: ${file.name}
Link: ${buildDriveFileUrl(file.id)}
Resumo: Este conteúdo está armazenado como vídeo no Google Drive. Consulte o arquivo pelo link acima.`;
  }

  return `Arquivo disponível: ${file.name}
Link: ${buildDriveFileUrl(file.id)}
Resumo: Este conteúdo está armazenado no Google Drive. Consulte o arquivo pelo link acima.`;
}

// ── Main: fetch all documents ─────────────────

export async function getDriveDocuments(): Promise<DriveDocument[]> {
  const files = await listFilesInFolder();

  const documents: DriveDocument[] = [];

  for (const file of files) {
    try {
      let content = "";

      // Google Docs
      if (file.mimeType === "application/vnd.google-apps.document") {
        content = await extractGoogleDocText(file.id);

        // adiciona link útil ao final
        content = `${content}\n\nLink do documento: ${buildGoogleDocUrl(file.id)}`;
      }

      // TXT / plain text
      else if (file.mimeType === "text/plain") {
        content = await extractPlainTextFile(file.id);
      }

      // PDF, vídeo e outros
      else {
        content = buildFallbackContent(file);
      }

      documents.push({
        id: file.id,
        name: normalizeString(file.name),
        mimeType: normalizeString(file.mimeType),
        content: normalizeString(content).trim(),
      });
    } catch (error) {
      console.error(`Erro ao processar arquivo do Drive: ${file.name}`, error);

      documents.push({
        id: file.id,
        name: normalizeString(file.name),
        mimeType: normalizeString(file.mimeType),
        content: buildFallbackContent(file),
      });
    }
  }

  return documents;
}
