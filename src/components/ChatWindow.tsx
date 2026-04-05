"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types";
import MessageBubble, { LoadingBubble } from "./MessageBubble";
import { MessageSquare } from "lucide-react";

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
}

export default function ChatWindow({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gosports-light border border-gosports-primary/20 flex items-center justify-center">
          <MessageSquare size={28} className="text-gosports-primary/60" />
        </div>
        <div>
          <p className="text-gosports-dark font-600 font-display">
            Nenhuma pergunta ainda
          </p>
          <p className="text-sm text-gosports-gray mt-1">
            Use os botões acima ou escreva sua dúvida
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 px-2">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isLoading && <LoadingBubble />}
      <div ref={bottomRef} />
    </div>
  );
}
