"use client";

import { SuggestedQuestion } from "@/types";

const SUGGESTED: SuggestedQuestion[] = [
  { id: "1", text: "Como baixar o app?", icon: "📱" },
  { id: "2", text: "Como criar conta?", icon: "👤" },
  { id: "3", text: "Como reservar uma quadra?", icon: "🏟️" },
  { id: "4", text: "Como recuperar senha?", icon: "🔑" },
  { id: "5", text: "Como funciona o QR Code?", icon: "📲" },
];

interface Props {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export default function SuggestedQuestions({ onSelect, disabled = false }: Props) {
  function handleClick(text: string) {
    if (disabled) return;
    onSelect(text);
  }

  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-gosports-gray uppercase tracking-widest mb-3 text-center">
        Perguntas frequentes
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTED.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => handleClick(q.text)}
            disabled={disabled}
            aria-label={q.text}
            className="
              flex items-center gap-2
              px-4 py-2.5
              bg-white border border-gosports-border
              rounded-full text-sm font-medium text-gosports-dark
              shadow-sm
              hover:border-gosports-primary hover:bg-gosports-light hover:text-gosports-secondary
              hover:shadow-gosports-sm
              active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gosports-border disabled:hover:text-gosports-dark
              transition-all duration-150 ease-out
              cursor-pointer
            "
          >
            <span className="text-base leading-none" aria-hidden="true">
              {q.icon}
            </span>
            <span>{q.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
