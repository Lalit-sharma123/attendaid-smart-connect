import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bot, Send, Sparkles, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { askAiAssistantApi } from "@/services/aiAssistantApi";

type ChatMessage = {
  role: "user" | "ai";
  text: string;
  type?: string;
  actions?: string[];
  data?: any;
};

const suggestedPrompts = [
  "Show BCA students",
  "today attendance",
  "low attendance students",
  "alerts summary",
  "create alert camera offline at Main Gate",
];

function actionLabel(action: string) {
  return action.replaceAll("_", " ");
}

export function AIAssistant() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Hi, I am your Attendance AI Assistant. Ask me about students, attendance, cameras, alerts, or ask me to create an alert.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(text?: string) {
    const message = (text ?? input).trim();

    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const res = await askAiAssistantApi(message);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: res.reply || "Done.",
          type: res.type,
          actions: res.actions || [],
          data: res.data,
        },
      ]);
    } catch (error: any) {
      toast.error(error.message || "AI Assistant failed");

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "I could not process that request. Please check backend auth/API and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleAction(action: string) {
    if (action === "view_alerts") {
      navigate({ to: "/admin/alerts" });
      setOpen(false);
      return;
    }

    if (action === "view_students") {
      navigate({ to: "/admin/students" });
      setOpen(false);
      return;
    }

    if (action === "view_attendance") {
      navigate({ to: "/admin/attendance" });
      setOpen(false);
      return;
    }

    if (action === "export_report") {
      navigate({ to: "/admin/reports" });
      setOpen(false);
      return;
    }

    if (action === "create_alert") {
      setInput("create alert ");
      return;
    }

    toast.info(actionLabel(action));
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90"
      >
        <Sparkles className="size-4" />
        AI Assistant
      </button>

      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-full bg-primary/15 text-primary">
                <Bot className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Attendance AI Assistant</div>
                <div className="text-xs text-muted-foreground">
                  Real backend data
                </div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="grid size-8 place-items-center rounded-md hover:bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="max-h-[420px] min-h-[320px] space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>

                  {message.actions?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {message.actions.map((action) => (
                        <button
                          key={action}
                          onClick={() => handleAction(action)}
                          className="rounded-md bg-background/80 px-2 py-1 text-[11px] text-foreground hover:bg-background"
                        >
                          {actionLabel(action)}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t px-4 py-3">
            <div className="mb-2 text-xs text-muted-foreground">
              Suggested prompts
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="rounded-full border px-2.5 py-1 text-[11px] hover:bg-secondary disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about attendance…"
                className="h-10 flex-1 rounded-md bg-secondary/70 px-3 text-sm outline-none focus:bg-card focus:ring-2 focus:ring-ring"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
