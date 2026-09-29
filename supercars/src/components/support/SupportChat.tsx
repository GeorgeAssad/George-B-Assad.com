"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { SupportAnswer } from "@/domain/support";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { IconArrow, IconClose } from "@/components/ui/icons";
import { closeSupportChat, useSupportChatOpen } from "@/lib/ui-store";
import { LIMITS } from "@/lib/validation";

interface Message { readonly id: number; readonly role: "customer" | "assistant"; readonly text: string }

const GREETING: Message = { id: 0, role: "assistant", text: "Hi! I'm the SuperCars demo assistant. I can answer questions about prices, sizes, delivery and order status — using demo data only." };
const START_SUGGESTIONS = ["How much does a poster cost?", "How long is delivery?", "What sizes are available?", "Where is order SC-100234?"];

function ChatBody() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [suggestions, setSuggestions] = useState<readonly string[]>(START_SUGGESTIONS);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, busy]);

  const send = async (raw: string) => {
    const message = raw.trim().slice(0, LIMITS.supportMessage);
    if (!message || busy) return;
    setMessages((m) => [...m, { id: nextId.current++, role: "customer", text: message }]);
    setText("");
    setSuggestions([]);
    setBusy(true);
    try {
      const res = await fetch("/api/support/message", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message }) });
      if (res.status === 429) throw new Error("rate");
      if (!res.ok) throw new Error("fail");
      const answer = (await res.json()) as SupportAnswer;
      setMessages((m) => [...m, { id: nextId.current++, role: "assistant", text: answer.text }]);
      setSuggestions(answer.suggestions);
    } catch (err) {
      const rate = err instanceof Error && err.message === "rate";
      setMessages((m) => [...m, { id: nextId.current++, role: "assistant", text: rate ? "You're sending messages quickly — give me a moment, then try again." : "Sorry, I couldn't reach support just now. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(text);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <h2 className="h-display text-3xl">Support</h2>
          <Badge tone="demo" className="mt-2">Demo assistant</Badge>
        </div>
        <button type="button" onClick={closeSupportChat} className="-m-2 rounded-full p-2 text-muted hover:text-fg" aria-label="Close support chat"><IconClose /></button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4" role="log" aria-label="Conversation" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "customer" ? "justify-end" : "justify-start"}`}>
            <p className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm ${m.role === "customer" ? "rounded-br-md bg-red text-on-red" : "rounded-bl-md border border-line bg-elevated"}`}>{m.text}</p>
          </div>
        ))}
        {busy && <div className="flex justify-start" aria-label="Assistant is typing"><p className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-elevated px-4 py-3"><span className="size-1.5 animate-pulse rounded-full bg-muted" /><span className="size-1.5 animate-pulse rounded-full bg-muted [animation-delay:150ms]" /><span className="size-1.5 animate-pulse rounded-full bg-muted [animation-delay:300ms]" /></p></div>}
        <div ref={endRef} />
      </div>

      <div className="safe-bottom border-t border-line bg-surface px-5 pt-3">
        {suggestions.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-2" aria-label="Suggested questions">
            {suggestions.map((s) => <li key={s}><button type="button" onClick={() => void send(s)} className="rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-muted hover:border-fg hover:text-fg">{s}</button></li>)}
          </ul>
        )}
        <form onSubmit={onSubmit} className="flex gap-2">
          <label htmlFor={inputId} className="sr-only">Your message</label>
          <input id={inputId} value={text} onChange={(e) => setText(e.target.value)} maxLength={LIMITS.supportMessage} autoComplete="off" placeholder="Ask about prices, sizes, delivery…" className="field h-12 flex-1 rounded-full" />
          <button type="submit" disabled={busy || !text.trim()} className="btn btn-primary !min-h-12 !px-4" aria-label="Send message"><IconArrow size={18} /></button>
        </form>
        <p className="pb-1 pt-2 text-center text-[0.6875rem] text-subtle">Demo assistant · answers come from local demo data, not live policies.</p>
      </div>
    </div>
  );
}

export function SupportChat() {
  const open = useSupportChatOpen();
  return (
    <Dialog open={open} onClose={closeSupportChat} label="Customer support chat" placement="right">
      <ChatBody />
    </Dialog>
  );
}
