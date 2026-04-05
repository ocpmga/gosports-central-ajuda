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

export default function SuggestedQuestions({ onSelect, disabled }: Props) {
  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-gosports-gray uppercase tracking-widest mb-3 text-center">
        Perguntas frequentes
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTED.map((q, i) => (
          <button
            key={q.id}
            onClick={() => !disabled && onSelect(q.text)}
            disabled={disabled}
            className="
              group flex items-center gap-2 px-4 py-2.5
              bg-white border border-gosports-border
              rounded-full text-sm font-medium text-gosports-dark
              shadow-sm
              hover:border-gosports-primary hover:bg-gosports-light hover:text-gosports-secondary
              hover:shadow-gosports-sm
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200 ease-out
              btn-press
            "
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-base leading-none">{q.icon}</span>
            <span>{q.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
