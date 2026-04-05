// ============================================
// GoSports — Google Drive Integration
// ============================================
// Uses a Google Service Account to read documents
// from a shared Drive folder. No OAuth flow needed.

import { google } from "googleapis";
import { DriveDocument } from "@/types";

// ── Auth ──────────────────────────────────────
function getGoogleAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set."
    );
  }

  let credentials: object;
  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON. Make sure it's a single-line stringified JSON."
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return auth;
}

// ── List files in folder ──────────────────────
async function listFilesInFolder(
  folderId: string
): Promise<{ id: string; name: string; mimeType: string }[]> {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType)",
    pageSize: 50,
  });

  return res.data.files || [];
}

// ── Extract text from a Google Doc ───────────
async function extractGoogleDocText(fileId: string): Promise<string> {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.export(
    { fileId, mimeType: "text/plain" },
    { responseType: "text" }
  );

  return (res.data as string) || "";
}

// ── Extract text from a plain text / markdown file ──
async function extractPlainTextFile(fileId: string): Promise<string> {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "text" }
  );

  return (res.data as string) || "";
}

// ── Main: fetch all documents from folder ─────
export async function fetchDriveDocuments(): Promise<DriveDocument[]> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID environment variable is not set.");
  }

  const files = await listFilesInFolder(folderId);
  const documents: DriveDocument[] = [];

  for (const file of files) {
    if (!file.id || !file.name) continue;

    try {
      let content = "";

      if (file.mimeType === "application/vnd.google-apps.document") {
        content = await extractGoogleDocText(file.id);
      } else if (
        file.mimeType === "text/plain" ||
        file.mimeType === "text/markdown"
      ) {
        content = await extractPlainTextFile(file.id);
      } else {
        console.log(
          `Skipping unsupported file type: ${file.mimeType} — ${file.name}`
        );
        continue;
      }

      if (content.trim()) {
        documents.push({
          id: file.id,
          name: file.name,
          content: content.trim(),
          mimeType: file.mimeType,
        });
      }
    } catch (err) {
      console.error(`Failed to read file "${file.name}":`, err);
    }
  }

  return documents;
}

// ── Simple keyword relevance search ───────────
export function findRelevantDocuments(
  documents: DriveDocument[],
  question: string,
  maxDocs = 4
): DriveDocument[] {
  const words = question
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (words.length === 0) return documents.slice(0, maxDocs);

  const scored = documents.map((doc) => {
    const docText = (doc.name + " " + doc.content)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    let score = 0;
    for (const word of words) {
      const regex = new RegExp(word, "g");
      const hits = (docText.match(regex) || []).length;
      score += hits;
    }

    return { doc, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxDocs)
    .map(({ doc }) => doc);
}
