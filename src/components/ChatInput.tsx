"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";

// ── Web Speech API types ──────────────────────
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface Props {
  onSend: (question: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, isLoading, disabled }: Props) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [hasSpeech, setHasSpeech] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<EventTarget | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [value]);

  // Check for speech support
  useEffect(() => {
    const hasSpeechAPI =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setHasSpeech(hasSpeechAPI);
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMic = () => {
    if (!hasSpeech) return;

    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;

    if (isListening && recognitionRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognitionRef.current as any).stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from({ length: event.results.length }, (_, i) =>
        event.results[i][0].transcript
      ).join("");
      setValue(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const canSend = value.trim().length > 0 && !isLoading && !disabled;

  return (
    <div className="relative">
      {/* Input container */}
      <div
        className={`
          flex items-end gap-2 
          bg-white border-2 rounded-2xl 
          shadow-gosports-sm
          transition-all duration-200
          ${
            isLoading || disabled
              ? "border-gosports-border opacity-70"
              : "border-gosports-border focus-within:border-gosports-primary focus-within:shadow-gosports-md"
          }
        `}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="Digite sua pergunta sobre o GoSports..."
          rows={1}
          className="
            flex-1 resize-none bg-transparent
            px-4 py-3.5 text-sm text-gosports-dark
            placeholder:text-gosports-gray/60
            outline-none min-h-[52px] max-h-[120px]
            leading-relaxed
          "
          style={{ scrollbarWidth: "none" }}
        />

        {/* Mic button */}
        {hasSpeech && (
          <button
            type="button"
            onClick={toggleMic}
            disabled={isLoading || disabled}
            title={isListening ? "Parar gravação" : "Falar pergunta"}
            className={`
              flex-shrink-0 mb-2.5 mr-1
              w-9 h-9 rounded-xl flex items-center justify-center
              transition-all duration-200 btn-press
              ${
                isListening
                  ? "bg-red-500 text-white mic-active"
                  : "bg-gosports-light text-gosports-primary hover:bg-gosports-primary hover:text-white"
              }
              disabled:opacity-40 disabled:cursor-not-allowed
            `}
          >
            {isListening ? (
              <MicOff size={15} />
            ) : (
              <Mic size={15} />
            )}
          </button>
        )}

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          title="Enviar pergunta"
          className={`
            flex-shrink-0 mb-2.5 mr-2.5
            w-9 h-9 rounded-xl flex items-center justify-center
            transition-all duration-200 btn-press
            ${
              canSend
                ? "bg-gosports-primary text-white shadow-gosports-sm hover:bg-gosports-secondary hover:shadow-gosports-md"
                : "bg-gosports-border text-gosports-gray cursor-not-allowed"
            }
          `}
        >
          {isLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} className={canSend ? "" : "opacity-50"} />
          )}
        </button>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-xs text-gosports-gray/60">
          {isListening
            ? "🔴 Ouvindo... fale sua pergunta"
            : "Enter para enviar · Shift+Enter nova linha"}
        </span>
        <span
          className={`text-xs transition-colors ${
            value.length > 800 ? "text-red-400" : "text-gosports-gray/40"
          }`}
        >
          {value.length}/1000
        </span>
      </div>
    </div>
  );
}
