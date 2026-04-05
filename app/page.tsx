"use client";

import { useState, useCallback, useId } from "react";
import Header from "@/components/Header";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import { ChatMessage, ChatResponse } from "@/types";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function HomePage() {
  const baseId = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Send question ───────────────────────────
  const handleSend = useCallback(
    async (question: string) => {
      if (!question.trim() || isLoading) return;
      setError(null);

      const userMsg: ChatMessage = {
        id: `${baseId}-u-${Date.now()}`,
        role: "user",
        content: question.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const history = messages.slice(-8).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: question.trim(), history }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error || `Erro ${res.status}: ${res.statusText}`
          );
        }

        const data: ChatResponse = await res.json();

        const assistantMsg: ChatMessage = {
          id: `${baseId}-a-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          timestamp: new Date(),
          sources: data.sources,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Erro ao conectar com o servidor. Tente novamente.";
        setError(msg);

        const errMsg: ChatMessage = {
          id: `${baseId}-e-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Desculpe, ocorreu um erro: ${msg}\n\nTente novamente ou entre em contato com o suporte GoSports.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, baseId]
  );

  // ── Clear chat ──────────────────────────────
  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gosports-light bg-pattern relative overflow-hidden">
      {/* Decorative blobs */}
      <div
        className="blob absolute top-0 left-0 w-80 h-80 bg-gosports-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden
      />
      <div
        className="blob blob-2 absolute bottom-0 right-0 w-96 h-96 bg-gosports-accent/15 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none"
        aria-hidden
      />
      <div
        className="blob blob-3 absolute top-1/2 right-0 w-64 h-64 bg-gosports-secondary/8 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8">
        {/* Header */}
        <Header />

        {/* Main card */}
        <div className="glass-card rounded-3xl shadow-gosports-lg overflow-hidden border border-white/80">

          {/* ── Suggested questions ── */}
          <div className="px-5 sm:px-8 py-6 border-b border-gosports-border/60 bg-white/50">
            <SuggestedQuestions
              onSelect={handleSend}
              disabled={isLoading}
            />
          </div>

          {/* ── Chat window ── */}
          <div className="min-h-[340px] max-h-[500px] overflow-y-auto px-4 sm:px-6 bg-gosports-light/30">
            <ChatWindow messages={messages} isLoading={isLoading} />
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div className="mx-4 sm:mx-6 mb-2 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span className="flex-1 text-xs">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 text-xs font-600"
              >
                ✕
              </button>
            </div>
          )}

          {/* ── Input area ── */}
          <div className="px-4 sm:px-6 py-5 bg-white/60 border-t border-gosports-border/40">
            <ChatInput
              onSend={handleSend}
              isLoading={isLoading}
              disabled={false}
            />
          </div>
        </div>

        {/* ── Footer strip ── */}
        <div className="mt-4 flex items-center justify-between px-2">
          <p className="text-xs text-gosports-gray/60">
            Powered by{" "}
            <span className="text-gosports-primary font-600">GoSports AI</span>{" "}
            · Claude Sonnet
          </p>

          {messages.length > 0 && (
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs text-gosports-gray hover:text-gosports-primary disabled:opacity-40 transition-colors font-500"
            >
              <RefreshCw size={12} />
              Nova conversa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
