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
    <div className="w-full max-w-md bg-card rounded-3xl border border-border overflow-hidden shadow-xl">
      {/* Chat Area */}
      <div className="h-80 overflow-y-auto p-6 space-y-4 bg-secondary/30">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.isBot ? '' : 'justify-end'} animate-fade-in`}
          >
            {message.isBot && (
              <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-background" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                message.isBot
                  ? 'bg-card border border-border text-foreground'
                  : 'bg-foreground text-background'
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
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" 
                  alt="User" 
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Playback Control */}
      <div className="p-4 flex justify-center">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
          <div className="w-3 h-3 border-l-2 border-r-2 border-foreground/50 flex gap-0.5">
            <div className="w-1 h-3 bg-foreground/50 rounded-full" />
            <div className="w-1 h-3 bg-foreground/50 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
