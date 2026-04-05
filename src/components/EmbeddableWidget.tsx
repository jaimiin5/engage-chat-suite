import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, X, MessageCircle, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface EmbeddableWidgetProps {
  botId?: string;
  theme?: "light" | "dark";
  position?: "bottom-right" | "bottom-left";
  primaryColor?: string;
  iconType?: "icon" | "alphabet";
  iconText?: string;
  title?: string;
  subtitle?: string;
  welcomeMessage?: string;
  placeholder?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const EmbeddableWidget = ({
  botId = "demo",
  theme = "dark",
  position = "bottom-right",
  primaryColor = "#000000",
  iconType = "icon",
  iconText = "",
  title = "ChatFlow Assistant",
  subtitle = "Always online",
  welcomeMessage = "Hi! 👋 I'm your AI assistant. How can I help you today?",
  placeholder = "Type a message...",
}: EmbeddableWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const color = primaryColor || "#000000";

  // Determine if color is light to pick contrasting text
  const isLightColor = (hex: string) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  };

  const colorTextClass = isLightColor(color) ? "text-gray-900" : "text-white";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
    };

    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setIsLoading(true);

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map(({ role, content }) => ({ role, content })),
          botId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line.startsWith(":") || line === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            // Incomplete JSON
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== assistantId),
        {
          id: assistantId,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    streamChat(message);
  };

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  const isDark = theme === "dark";

  const renderBotAvatar = (size: "sm" | "md" = "sm") => {
    const sizeClasses = size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";
    const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center flex-shrink-0 font-semibold",
          sizeClasses,
          colorTextClass
        )}
        style={{ backgroundColor: color }}
      >
        {iconType === "alphabet" && iconText
          ? iconText.toUpperCase()
          : <Bot className={iconSize} />}
      </div>
    );
  };

  return (
    <div className={cn("fixed z-50", positionClasses[position])}>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "mb-4 w-[360px] max-h-[500px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-fade-in",
            isDark
              ? "bg-gray-950 text-white border-gray-800"
              : "bg-white text-gray-900 border-gray-200"
          )}
        >
          {/* Header */}
          <div className="p-4" style={{ backgroundColor: color }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                {iconType === "alphabet" && iconText ? (
                  <span className={cn("font-semibold text-sm", colorTextClass)}>
                    {iconText.toUpperCase()}
                  </span>
                ) : (
                  <Bot className={cn("w-5 h-5", colorTextClass)} />
                )}
              </div>
              <div className="flex-1">
                <h3 className={cn("font-semibold", colorTextClass)}>{title}</h3>
                <p className={cn("text-xs opacity-80", colorTextClass)}>{subtitle}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <Minimize2 className={cn("w-4 h-4", colorTextClass)} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className={cn(
              "flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[320px]",
              isDark ? "bg-gray-950" : "bg-gray-50"
            )}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.role === "user" ? "justify-end" : ""
                )}
              >
                {message.role === "assistant" && renderBotAvatar("sm")}
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                    message.role === "user"
                      ? cn("rounded-tr-sm", colorTextClass)
                      : isDark
                        ? "bg-gray-800 text-gray-100 rounded-tl-sm"
                        : "bg-white text-gray-900 rounded-tl-sm border border-gray-200"
                  )}
                  style={
                    message.role === "user"
                      ? { backgroundColor: color }
                      : undefined
                  }
                >
                  {message.content || (
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  )}>
                    <User className={cn("w-4 h-4", isDark ? "text-gray-300" : "text-gray-600")} />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className={cn(
              "p-3 border-t",
              isDark ? "border-gray-800" : "border-gray-200"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2",
                isDark
                  ? "bg-gray-800 text-white placeholder:text-gray-400"
                  : "bg-gray-100 text-gray-900 placeholder:text-gray-500"
              )}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50",
                  colorTextClass
                )}
                style={{ backgroundColor: color }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 font-semibold",
          colorTextClass
        )}
        style={{ backgroundColor: color }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : iconType === "alphabet" && iconText ? (
          <span className="text-lg">{iconText.toUpperCase()}</span>
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default EmbeddableWidget;