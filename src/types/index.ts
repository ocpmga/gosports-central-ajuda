// ============================================
// GoSports Central de Ajuda — Types
// ============================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: DocumentSource[];
}

export interface DocumentSource {
  name: string;
  id: string;
}

export interface ChatRequest {
  question: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export interface ChatResponse {
  answer: string;
  sources: DocumentSource[];
  found: boolean;
}

export interface DriveDocument {
  id: string;
  name: string;
  content: string;
  mimeType: string;
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  icon: string;
}
