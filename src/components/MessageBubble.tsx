"use client";

import { ChatMessage } from "@/types";
import { DocumentSource } from "@/types";

// ── Simple markdown renderer (no deps) ───────
function renderMarkdown(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`(.+?)`/g, "<code>$1</code>")
    // Unordered lists
    .replace(/^[-•]\s(.+)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>(\n|$))+/g, "<ul>$&</ul>")
    // Ordered lists
    .replace(/^\d+\.\s(.+)/gm, "<li>$1</li>")
    // Line breaks — double newline = new paragraph
    .replace(/\n\n+/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

// ── Loading dots ──────────────────────────────
export function LoadingBubble() {
  return (
    <div className="flex items-start gap-3 message-enter">
      <Avatar role="assistant" />
      <div className="bg-white border border-gosports-border rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
        <div className="flex gap-1.5 items-center h-5">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
      </div>
    </div>
  );
}

// ── Avatar ────────────────────────────────────
function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "user") {
    return (
      <div className="w-8 h-8 rounded-full bg-gosports-accent/20 border-2 border-gosports-accent/40 flex items-center justify-center flex-shrink-0 text-sm">
        👤
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gosports-primary flex items-center justify-center flex-shrink-0 shadow-gosports-sm flex-shrink-0">
      <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="2" />
        <path
          d="M7 11 C7 8 9 6 11 6 C13 6 15 8 15 11"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="11" cy="15" r="2" fill="white" />
      </svg>
    </div>
  );
}

// ── Sources pill ──────────────────────────────
function Sources({ sources }: { sources: DocumentSource[] }) {
  if (!sources.length) return null;
  return (
    <div className="mt-3 pt-3 border-t border-gosports-border/60 flex flex-wrap gap-1.5">
      <span className="text-xs text-gosports-gray font-500">Fontes:</span>
      {sources.map((s) => (
        <span
          key={s.id}
          className="text-xs bg-gosports-light text-gosports-secondary border border-gosports-primary/20 px-2 py-0.5 rounded-full font-500"
        >
          📄 {s.name}
        </span>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────
interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex items-start gap-3 justify-end message-enter">
        <div className="max-w-[80%] bg-gosports-primary text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-gosports-sm">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <Avatar role="user" />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 message-enter">
      <Avatar role="assistant" />
      <div className="max-w-[85%] bg-white border border-gosports-border rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
        <div
          className="text-sm leading-relaxed text-gosports-dark markdown-content"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(message.content),
          }}
        />
        {message.sources && message.sources.length > 0 && (
          <Sources sources={message.sources} />
        )}
        <div className="mt-2 text-right">
          <span className="text-xs text-gosports-gray/60">
            {message.timestamp.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
