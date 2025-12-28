import { useState, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  typing?: boolean;
}

const ChatWidget = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! 👋 I'm your AI assistant. How can I help you today?", isBot: true }
  ]);
  const [currentDemo, setCurrentDemo] = useState(0);

  const demoConversations = [
    { user: "What are your pricing plans?", bot: "We offer three plans: Free for startups, Pro at $49/mo for growing businesses, and Enterprise for custom solutions. Would you like details on any specific plan?" },
    { user: "How do I integrate the chatbot?", bot: "Integration is simple! Just add our widget script to your website or use our REST API. I can walk you through the process step by step." },
    { user: "Can I customize the chatbot?", bot: "Absolutely! You can customize colors, responses, personality, and train it on your own data. The possibilities are endless!" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const demo = demoConversations[currentDemo % demoConversations.length];
      
      // Add user message
      setMessages(prev => [...prev, { id: Date.now(), text: demo.user, isBot: false }]);
      
      // Add typing indicator
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "", isBot: true, typing: true }]);
      }, 500);
      
      // Replace typing with actual message
      setTimeout(() => {
        setMessages(prev => {
          const filtered = prev.filter(m => !m.typing);
          return [...filtered, { id: Date.now() + 2, text: demo.bot, isBot: true }];
        });
      }, 2000);
      
      // Reset after showing 2 exchanges
      setTimeout(() => {
        if (currentDemo >= 1) {
          setMessages([{ id: 1, text: "Hi! 👋 I'm your AI assistant. How can I help you today?", isBot: true }]);
          setCurrentDemo(0);
        } else {
          setCurrentDemo(prev => prev + 1);
        }
      }, 5000);
      
    }, 6000);

    return () => clearInterval(interval);
  }, [currentDemo]);

  return (
    <div className="w-full max-w-sm bg-card rounded-2xl border border-border overflow-hidden shadow-2xl shadow-primary/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-primary-foreground">ChatFlow Assistant</h3>
            <p className="text-xs text-primary-foreground/80">Always online</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto p-4 space-y-3 bg-background/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.isBot ? '' : 'justify-end'} animate-fade-in`}
          >
            {message.isBot && (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                message.isBot
                  ? 'bg-secondary text-secondary-foreground rounded-tl-none'
                  : 'bg-primary text-primary-foreground rounded-tr-none'
              }`}
            >
              {message.typing ? (
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                message.text
              )}
            </div>
            {!message.isBot && (
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-accent" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
            disabled
          />
          <button className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
