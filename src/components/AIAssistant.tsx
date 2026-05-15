import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bot, Sparkles, Send, X } from "lucide-react";
import { toast } from "sonner";

const prompts = [
  "Show students with low attendance",
  "Summarize today's attendance",
  "Find spoof attempts this week",
  "Which camera has poor recognition?",
  "Generate BCA Section A report",
];

const responses: Record<string, string> = {
  "Show students with low attendance": "10 students below 75%. Top: Divya Nair (58%), Aman Gupta (64%), Rohan Das (67%). Recommend mentor outreach.",
  "Summarize today's attendance": "1,078 of 1,240 (86.9%) marked present. 48 late, 162 absent. 7 spoof attempts blocked at Main Gate.",
  "Find spoof attempts this week": "13 attempts blocked. 9 at Main Gate, 3 at Lab Block, 1 at Auditorium. All resolved.",
  "Which camera has poor recognition?": "CAM-03 (Library) at 62% health · 220ms latency. Recalibration recommended.",
  "Generate BCA Section A report": "Generating BCA Section A report… Avg attendance 89%, 41/45 present today.",
};

type Msg = { role: "user" | "ai"; text: string; actions?: boolean };

export function AIAssistant() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "1,078 of 1,240 students marked present (86.9%). 7 spoof attempts blocked. Camera 3 needs attention." },
  ]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const reply = responses[text] ?? `Analyzing "${text}"… Result: 86.9% attendance, 7 incidents, 12 cameras online.`;
    setMessages((m) => [...m, { role: "user", text }, { role: "ai", text: reply, actions: true }]);
    setInput("");
  };

  return (
    <>
      <button onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 grid place-items-center hover:scale-105 transition-transform"
        aria-label="AI Assistant">
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
            {messages.map((m, i) => (
              <div key={i} className={`rounded-lg p-3 ${m.role === "user" ? "bg-primary/10 ml-6" : "bg-secondary/60 mr-6"}`}>
                <div className="text-xs text-muted-foreground mb-1">{m.role === "user" ? "You" : "AI"}</div>
                {m.text}
                {m.actions && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    <button onClick={() => navigate({ to: "/admin/attendance" })} className="text-[11px] px-2 py-1 rounded-md bg-card border">View Data</button>
                    <button onClick={() => toast.success("Report exported")} className="text-[11px] px-2 py-1 rounded-md bg-card border">Export Report</button>
                    <button onClick={() => { toast.success("Alert created"); navigate({ to: "/admin/alerts" }); }} className="text-[11px] px-2 py-1 rounded-md bg-primary text-primary-foreground">Create Alert</button>
                  </div>
                )}
              </div>
            ))}
            <div className="text-xs text-muted-foreground pt-2">Suggested prompts</div>
            <div className="flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button key={p} onClick={() => send(p)} className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent transition-colors">{p}</button>
              ))}
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="p-3 border-t flex items-center gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about attendance…"
              className="flex-1 h-9 px-3 rounded-md bg-secondary/60 text-sm outline-none focus:bg-card focus:ring-2 focus:ring-ring" />
            <button type="submit" className="size-9 rounded-md bg-primary text-primary-foreground grid place-items-center"><Send className="size-4" /></button>
          </form>
        </div>
      )}
    </>
  );
}
