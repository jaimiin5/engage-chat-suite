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
  primaryColor,
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: allMessages.map(({ role, content }) => ({ role, content })),
          botId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Add initial empty assistant message
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
            // Incomplete JSON, will be handled in next chunk
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

  const themeClasses = {
    light: {
      container: "bg-white text-gray-900 border-gray-200",
      header: "bg-gray-900",
      headerText: "text-white",
      input: "bg-gray-100 text-gray-900 placeholder:text-gray-500",
      userBubble: "bg-gray-900 text-white",
      botBubble: "bg-gray-100 text-gray-900",
      button: "bg-gray-900 hover:bg-gray-800",
    },
    dark: {
      container: "bg-gray-950 text-white border-gray-800",
      header: "bg-gray-900",
      headerText: "text-white",
      input: "bg-gray-800 text-white placeholder:text-gray-400",
      userBubble: "bg-white text-gray-900",
      botBubble: "bg-gray-800 text-gray-100",
      button: "bg-white hover:bg-gray-100",
    },
  };

  const currentTheme = themeClasses[theme];

  return (
    <div className={cn("fixed z-50", positionClasses[position])}>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "mb-4 w-[360px] max-h-[500px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-fade-in",
            currentTheme.container
          )}
        >
          {/* Header */}
          <div className={cn("p-4", currentTheme.header)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className={cn("w-5 h-5", currentTheme.headerText)} />
              </div>
              <div className="flex-1">
                <h3 className={cn("font-semibold", currentTheme.headerText)}>
                  {title}
                </h3>
                <p className={cn("text-xs opacity-80", currentTheme.headerText)}>
                  {subtitle}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Minimize2 className={cn("w-4 h-4", currentTheme.headerText)} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[320px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.role === "user" ? "justify-end" : ""
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-violet-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-2 rounded-2xl text-sm",
                    message.role === "user"
                      ? cn(currentTheme.userBubble, "rounded-tr-sm")
                      : cn(currentTheme.botBubble, "rounded-tl-sm")
                  )}
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
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-inherit">
            <div className={cn("flex items-center gap-2 rounded-xl px-4 py-2", currentTheme.input)}>
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
                  currentTheme.button
                )}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105",
          isOpen ? "rotate-0" : "rotate-0",
          theme === "dark"
            ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
        )}
        style={primaryColor ? { background: primaryColor } : undefined}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default EmbeddableWidget;
