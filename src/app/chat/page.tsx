"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Sparkles, ArrowLeft, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@/app/api/chat/route";

const SUGGESTIONS = [
  "Find a hostel near NSBM",
  "Cheap restaurants near University of Colombo",
  "24-hour pharmacy near Kelaniya campus",
  "What services does UniLife offer?",
  "How do I create a student account?",
];

function MessageBubble({ msg, isLatest }: { msg: ChatMessage; isLatest: boolean }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
          isUser ? "glass-strong" : "bg-blue-500/20 border border-blue-400/20"
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5 text-white/70" /> : <Bot className="w-3.5 h-3.5 text-blue-300" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-white/10 text-white rounded-br-sm"
            : "glass text-white/85 rounded-bl-sm"
        } ${isLatest ? "shadow-[0_4px_20px_rgba(37,99,235,0.15)]" : ""}`}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-blue-500/20 border border-blue-400/20">
        <Bot className="w-3.5 h-3.5 text-blue-300" />
      </div>
      <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-300/60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I ran into an error. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please check your connection and try again." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <main className="site-bg min-h-screen flex flex-col">
      {/* Header */}
      <div className="glass border-b border-white/[0.06] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-semibold text-sm">UniBot</span>
                <Sparkles className="w-3 h-3 text-blue-300" />
              </div>
              <span className="text-white/40 text-xs">AI campus guide · Powered by Groq</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col gap-5 overflow-y-auto">
        {/* Welcome state */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center flex-1 text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center mb-5">
              <Bot className="w-8 h-8 text-blue-300" />
            </div>
            <h2 className="text-white text-xl font-semibold mb-2">Hi, I&apos;m UniBot</h2>
            <p className="text-white/45 text-sm max-w-xs leading-relaxed mb-8">
              Your AI campus guide. Ask me anything about student services, accommodation, or daily life near university.
            </p>

            {/* Suggested questions */}
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="glass glass-sheen rounded-xl px-4 py-3 text-left text-white/60 text-sm hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message list */}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} isLatest={i === messages.length - 1 && msg.role === "assistant"} />
          ))}
        </AnimatePresence>

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="glass border-t border-white/[0.06] sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="glass-strong rounded-2xl flex items-end gap-3 px-4 py-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about hostels, restaurants, pharmacies…"
              rows={1}
              className="flex-1 bg-transparent text-white text-sm placeholder-white/25 resize-none outline-none leading-relaxed max-h-32 py-0.5"
              style={{ minHeight: "1.5rem" }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-white/20 text-xs text-center mt-2">
            UniBot can make mistakes. Verify important information independently.
          </p>
        </div>
      </div>
    </main>
  );
}
