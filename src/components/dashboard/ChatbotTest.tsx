import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface QAPair {
  id: string;
  question: string;
  answer: string;
  match_type: string;
}

interface ChatbotTestProps {
  chatbotId: string;
  chatbotName: string;
  welcomeMessage?: string;
  theme?: string;
}

const ChatbotTest = ({ chatbotId, chatbotName, welcomeMessage, theme = "dark" }: ChatbotTestProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    // Reset messages when chatbot changes
    setMessages(
      welcomeMessage
        ? [{ id: "welcome", role: "assistant", content: welcomeMessage }]
        : []
    );
    fetchQAPairs();
  }, [chatbotId, welcomeMessage]);

  const fetchQAPairs = async () => {
    const { data } = await supabase
      .from("chatbot_qa_pairs")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .eq("is_active", true)
      .order("priority", { ascending: false });

    if (data) {
      setQaPairs(data);
    }
  };

  const findQAMatch = (userMessage: string): string | null => {
    const normalizedMessage = userMessage.toLowerCase().trim();

    for (const qa of qaPairs) {
      const question = qa.question.toLowerCase().trim();

      switch (qa.match_type) {
        case "exact":
          if (normalizedMessage === question) return qa.answer;
          break;
        case "starts_with":
          if (normalizedMessage.startsWith(question)) return qa.answer;
          break;
        case "contains":
        default:
          if (normalizedMessage.includes(question)) return qa.answer;
          break;
      }
    }
    return null;
  };

  const resetChat = () => {
    setMessages(
      welcomeMessage
        ? [{ id: "welcome", role: "assistant", content: welcomeMessage }]
        : []
    );
    setInput("");
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Check Q&A pairs first
    const qaMatch = findQAMatch(userMessage);
    if (qaMatch) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: qaMatch },
        ]);
        setIsLoading(false);
      }, 300);
      return;
    }

    // No match, call AI
    const assistantId = crypto.randomUUID();
    let assistantContent = "";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg].map(({ role, content }) => ({
              role,
              content,
            })),
            botId: chatbotId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      // Check if response is JSON (non-streaming) or stream
      const contentType = response.headers.get("content-type") || "";
      
      if (contentType.includes("application/json")) {
        // Non-streaming response (AI disabled mode)
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "I couldn't find relevant information.";
        
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content },
        ]);
      } else {
        // Streaming response
        if (!response.body) {
          throw new Error("No response body");
        }

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
      }
    } catch (error) {
      console.error("Chat error:", error);
      // Friendly fallback message when AI is unavailable
      const fallbackMessages = [
        "Hey, glad to hear from you! 😊 I'll get back to you on this.",
        "Thanks for reaching out! Our team will look into this for you.",
        "Great question! I'll make sure someone gets back to you soon.",
        "Thanks for your message! We'll follow up with you shortly.",
      ];
      const fallbackResponse = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== assistantId),
        {
          id: assistantId,
          role: "assistant",
          content: fallbackResponse,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isDark = theme === "dark";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Test your chatbot</h3>
          <p className="text-xs text-muted-foreground">
            Send messages to test Q&A pairs and AI responses
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetChat}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Chat preview container */}
      <div
        className={cn(
          "rounded-xl border overflow-hidden",
          isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "px-4 py-3 border-b",
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                isDark ? "bg-gray-700" : "bg-gray-200"
              )}
            >
              <Bot
                className={cn(
                  "w-4 h-4",
                  isDark ? "text-violet-400" : "text-blue-500"
                )}
              />
            </div>
            <div>
              <p
                className={cn(
                  "text-sm font-medium",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {chatbotName}
              </p>
              <p
                className={cn(
                  "text-xs",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}
              >
                Test Mode
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          className={cn(
            "h-[320px] overflow-y-auto p-4 space-y-3",
            isDark ? "bg-gray-900" : "bg-white"
          )}
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-gray-500" : "text-gray-400"
                )}
              >
                Send a message to start testing
              </p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === "user" ? "justify-end" : ""
              )}
            >
              {message.role === "assistant" && (
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                    isDark ? "bg-violet-500/20" : "bg-blue-500/20"
                  )}
                >
                  <Bot
                    className={cn(
                      "w-3 h-3",
                      isDark ? "text-violet-400" : "text-blue-500"
                    )}
                  />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] px-3 py-2 rounded-xl text-sm",
                  message.role === "user"
                    ? isDark
                      ? "bg-violet-600 text-white rounded-tr-sm"
                      : "bg-blue-500 text-white rounded-tr-sm"
                    : isDark
                    ? "bg-gray-800 text-gray-100 rounded-tl-sm"
                    : "bg-gray-100 text-gray-900 rounded-tl-sm"
                )}
              >
                {message.content || (
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                    isDark ? "bg-cyan-500/20" : "bg-green-500/20"
                  )}
                >
                  <User
                    className={cn(
                      "w-3 h-3",
                      isDark ? "text-cyan-400" : "text-green-500"
                    )}
                  />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className={cn(
            "p-3 border-t",
            isDark ? "border-gray-700" : "border-gray-200"
          )}
        >
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              disabled={isLoading}
              className={cn(
                "flex-1",
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  : ""
              )}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
              className={isDark ? "bg-violet-600 hover:bg-violet-700" : ""}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Q&A info */}
      <div
        className={cn(
          "rounded-lg p-3 text-sm",
          isDark ? "bg-gray-800/50" : "bg-gray-50"
        )}
      >
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{qaPairs.length}</span>{" "}
          custom Q&A pair{qaPairs.length !== 1 ? "s" : ""} loaded. Messages
          matching Q&A pairs will respond instantly without using AI.
        </p>
      </div>
    </div>
  );
};

export default ChatbotTest;
