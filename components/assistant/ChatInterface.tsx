"use client";

import { useRef, useState } from "react";
import { Send, Sparkles, AlertTriangle, User } from "lucide-react";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ChatMessage } from "@/types";

const SUGGESTIONS = [
  "Where am I spending the most?",
  "Am I exceeding my monthly budget?",
  "Give me suggestions to reduce my spending.",
  "What was my highest expense?",
  "Summarize my spending this month.",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(question: string) {
    if (!question.trim() || loading) return;
    setUnavailable(null);
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 503) {
          setUnavailable(json.error);
        } else {
          setMessages((m) => [...m, { role: "assistant", content: `Error: ${json.error}` }]);
        }
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: json.answer }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <Card className="flex h-[70vh] flex-col p-0">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
        <Sparkles className="h-4 w-4 text-brand-600" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900">FinAI Assistant</h3>
          <p className="text-xs text-slate-500">Answers are based only on your real stored expenses.</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-600 px-4 py-2.5 text-sm text-white"
                  : "max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-800"
              }
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-500">
              Thinking...
            </div>
          </div>
        )}

        {unavailable && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{unavailable}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 border-t border-slate-200 p-3"
      >
        <Textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask about your spending..."
          className="resize-none"
        />
        <Button type="submit" disabled={loading} aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
