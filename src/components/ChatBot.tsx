import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Mic } from "lucide-react";
import { chatbotResponses } from "@/data/mockData";

type Message = { role: "user" | "assistant"; content: string };

const suggestedPrompts = [
  "Analyze current stock health",
  "Show products with high loss risk",
  "Explain anomaly detection results",
  "How can I prevent stock shrinkage?",
];

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Hi! I'm your InvenGuard AI assistant. Ask me anything about your inventory, stock health, or anomaly detection." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const key = text.trim().toLowerCase();
    const response = chatbotResponses[key] ||
      `I understand you're asking about "${text}". Based on the current inventory data:\n\n- **Total Products:** 8\n- **Active Anomalies:** 5\n- **System Status:** Active\n\nFor more specific analysis, try asking:\n- "Analyze current stock health"\n- "Show products with high loss risk"\n- "Explain anomaly detection results"`;

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setTyping(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-bg flex items-center justify-center glow-shadow hover:scale-110 transition-transform"
          style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
        >
          <MessageSquare className="w-6 h-6 text-primary-foreground" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] rounded-2xl glass-strong flex flex-col overflow-hidden"
          style={{ animation: "slide-up 0.3s ease-out" }}
        >
          {/* Header */}
          <div className="gradient-bg px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary-foreground" />
              <div>
                <p className="text-sm font-semibold text-primary-foreground">InvenGuard AI</p>
                <p className="text-xs text-primary-foreground/70">Always online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-primary-foreground/10 transition-colors">
              <X className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-primary" : "bg-secondary"
                }`}>
                  {msg.role === "user" ? <User className="w-3.5 h-3.5 text-primary-foreground" /> : <Bot className="w-3.5 h-3.5 text-secondary-foreground" />}
                </div>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_table]:text-xs [&_h2]:text-sm [&_h3]:text-xs [&_p]:text-xs [&_li]:text-xs [&_strong]:text-foreground">
                      {msg.content.split("\n").map((line, li) => {
                        if (line.startsWith("## ")) return <h2 key={li} className="font-bold mt-2 mb-1">{line.slice(3)}</h2>;
                        if (line.startsWith("### ")) return <h3 key={li} className="font-semibold mt-1.5 mb-0.5">{line.slice(4)}</h3>;
                        if (line.startsWith("| ")) return <p key={li} className="font-mono">{line}</p>;
                        if (line.startsWith("- ")) return <p key={li} className="ml-2">• {line.slice(2)}</p>;
                        if (line.match(/^\d+\./)) return <p key={li} className="ml-2">{line}</p>;
                        if (line.trim() === "") return <br key={li} />;
                        return <p key={li}>{line.replace(/\*\*(.*?)\*\*/g, (_, t) => t)}</p>;
                      })}
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-secondary-foreground" />
                </div>
                <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border/30 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about inventory..."
                className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                title="Voice input (coming soon)"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="p-2 rounded-lg gradient-bg text-primary-foreground disabled:opacity-50 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
