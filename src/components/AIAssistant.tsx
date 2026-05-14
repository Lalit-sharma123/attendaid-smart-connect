import { useState } from "react";
import { Bot, Sparkles, Send, X } from "lucide-react";

const prompts = [
  "Show students with low attendance",
  "Summarize today's attendance",
  "Find spoof attempts this week",
  "Which camera has poor recognition?",
  "Generate BCA Section A report",
];

export function AIAssistant() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 grid place-items-center hover:scale-105 transition-transform"
        aria-label="AI Assistant"
      >
        {open ? <X className="size-5" /> : <Bot className="size-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl bg-card border shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
          <div className="px-4 py-3 border-b bg-gradient-to-r from-primary/10 to-info/10 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <div>
              <div className="text-sm font-semibold">Attendance AI Assistant</div>
              <div className="text-[11px] text-muted-foreground">Online · GPT-Vision · Liveness v3</div>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3 text-sm">
            <div className="rounded-lg bg-secondary/60 p-3">
              <div className="text-xs text-muted-foreground mb-1">Today's snapshot</div>
              1,078 of 1,240 students marked present (86.9%). 7 spoof attempts blocked. Camera 3 needs attention.
            </div>
            <div className="text-xs text-muted-foreground">Suggested prompts</div>
            <div className="flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button key={p} className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent transition-colors">
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 border-t flex items-center gap-2">
            <input
              placeholder="Ask anything about attendance…"
              className="flex-1 h-9 px-3 rounded-md bg-secondary/60 text-sm outline-none focus:bg-card focus:ring-2 focus:ring-ring"
            />
            <button className="size-9 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
