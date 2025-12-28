import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

const widgetCode = `<!-- ChatFlow Widget -->
<script>
  window.ChatFlowConfig = {
    botId: "YOUR_BOT_ID",
    theme: "dark",
    position: "bottom-right"
  };
</script>
<script 
  src="https://cdn.chatflow.ai/widget.js" 
  async>
</script>`;

const apiCode = `// Send a message to your chatbot
const response = await fetch(
  'https://api.chatflow.ai/v1/chat',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      botId: 'YOUR_BOT_ID',
      message: 'Hello, I need help!',
      sessionId: 'user-123'
    })
  }
);

const data = await response.json();
console.log(data.reply);`;

const CodePreviewSection = () => {
  const [activeTab, setActiveTab] = useState<'widget' | 'api'>('widget');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab === 'widget' ? widgetCode : apiCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-background to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold">
              Integrate in
              <span className="gradient-text"> Minutes</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Add our embeddable widget with just 3 lines of code, or use our powerful 
              REST API for complete control over the chat experience.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">No backend required</h4>
                  <p className="text-sm text-muted-foreground">Just paste the code and go.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Works everywhere</h4>
                  <p className="text-sm text-muted-foreground">React, Vue, Angular, or plain HTML.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Full customization</h4>
                  <p className="text-sm text-muted-foreground">Match your brand perfectly.</p>
                </div>
              </div>
            </div>

            <Button variant="hero" size="lg">
              View Full Documentation
            </Button>
          </div>

          {/* Right Content - Code Preview */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-2xl shadow-primary/5">
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('widget')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'widget'
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Widget
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'api'
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                REST API
              </button>
            </div>

            {/* Code Block */}
            <div className="relative">
              <button
                onClick={handleCopy}
                className="absolute top-4 right-4 p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <pre className="p-6 overflow-x-auto text-sm">
                <code className="text-muted-foreground">
                  {activeTab === 'widget' ? widgetCode : apiCode}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CodePreviewSection;
