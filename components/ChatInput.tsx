"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";

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
}

export default function ChatInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [hasSpeech, setHasSpeech] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [value]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
    setHasSpeech(supported);
  }, []);

  const submitMessage = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isLoading, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitMessage();
      }
    },
    [submitMessage]
  );

  const toggleMic = useCallback(() => {
    if (!hasSpeech) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setValue(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [hasSpeech, isListening]);

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div className="relative">
      <div
        className={[
          "flex items-end gap-2",
          "bg-white border-2 rounded-2xl",
          "shadow-gosports-sm transition-all duration-200",
          isLoading
            ? "border-gosports-border opacity-70"
            : "border-gosports-border focus-within:border-gosports-primary focus-within:shadow-gosports-md",
        ].join(" ")}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Digite sua pergunta sobre o GoSports..."
          rows={1}
          aria-label="Campo de pergunta"
          className="
            flex-1 resize-none bg-transparent
            px-4 py-3.5 text-sm text-gosports-dark
            placeholder:text-gosports-gray/60
            outline-none min-h-[52px] max-h-[120px]
            leading-relaxed
          "
          style={{ scrollbarWidth: "none" }}
        />

        {hasSpeech && (
          <button
            type="button"
            onClick={toggleMic}
            disabled={isLoading}
            title={isListening ? "Parar gravação" : "Falar pergunta"}
            aria-label={isListening ? "Parar gravação" : "Falar pergunta"}
            className={[
              "flex-shrink-0 mb-2.5 mr-1",
              "w-9 h-9 rounded-xl flex items-center justify-center",
              "transition-all duration-200 active:scale-95",
              isListening
                ? "bg-red-500 text-white mic-active"
                : "bg-gosports-light text-gosports-primary hover:bg-gosports-primary hover:text-white",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
        )}

        <button
          type="button"
          onClick={submitMessage}
          disabled={!canSend}
          title="Enviar pergunta"
          aria-label="Enviar pergunta"
          className={[
            "flex-shrink-0 mb-2.5 mr-2.5",
            "w-9 h-9 rounded-xl flex items-center justify-center",
            "transition-all duration-200 active:scale-95",
            canSend
              ? "bg-gosports-primary text-white shadow-gosports-sm hover:bg-gosports-secondary hover:shadow-gosports-md cursor-pointer"
              : "bg-gosports-border text-gosports-gray cursor-not-allowed opacity-50",
          ].join(" ")}
        >
          {isLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
        </button>
      </div>

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
