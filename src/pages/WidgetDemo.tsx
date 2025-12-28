import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Copy, Check, ArrowLeft, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import EmbeddableWidget from "@/components/EmbeddableWidget";

const WidgetDemo = () => {
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");

  const embedCode = `<!-- ChatFlow Widget -->
<script
  src="https://YOUR_DOMAIN/widget.js"
  data-bot-id="YOUR_BOT_ID"
  data-theme="${theme}"
  data-position="${position}">
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Widget Demo - ChatFlow</title>
        <meta name="description" content="Try our embeddable AI chatbot widget. Customize themes, positions, and more." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
            <h1 className="text-xl font-display font-bold">Widget Demo</h1>
            <div className="w-24" />
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
                Try the <span className="gradient-text">Live Widget</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                This is a fully functional demo. Try chatting with our AI assistant!
              </p>
            </div>

            {/* Customization Controls */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold mb-4">Theme</h3>
                <div className="flex gap-3">
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="flex-1"
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="flex-1"
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </Button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold mb-4">Position</h3>
                <div className="flex gap-3">
                  <Button
                    variant={position === "bottom-right" ? "default" : "outline"}
                    onClick={() => setPosition("bottom-right")}
                    className="flex-1"
                  >
                    Bottom Right
                  </Button>
                  <Button
                    variant={position === "bottom-left" ? "default" : "outline"}
                    onClick={() => setPosition("bottom-left")}
                    className="flex-1"
                  >
                    Bottom Left
                  </Button>
                </div>
              </div>
            </div>

            {/* Embed Code */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Embed Code</h3>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-secondary overflow-x-auto text-sm">
                <code className="text-muted-foreground whitespace-pre-wrap break-all">{embedCode}</code>
              </pre>
            </div>

            {/* Instructions */}
            <div className="mt-12 p-6 rounded-2xl bg-secondary/30 border border-border">
              <h3 className="font-semibold mb-4">How to Integrate</h3>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm text-primary font-medium">1</span>
                  <span>Copy the embed code above</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm text-primary font-medium">2</span>
                  <span>Replace <code className="px-1.5 py-0.5 bg-secondary rounded text-sm">YOUR_DOMAIN</code> with your published app URL</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm text-primary font-medium">3</span>
                  <span>Replace <code className="px-1.5 py-0.5 bg-secondary rounded text-sm">YOUR_BOT_ID</code> with your chatbot's ID from the dashboard</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm text-primary font-medium">4</span>
                  <span>Paste it before the closing <code className="px-1.5 py-0.5 bg-secondary rounded text-sm">&lt;/body&gt;</code> tag of your website</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm text-primary font-medium">5</span>
                  <span>That's it! Your chatbot is now live.</span>
                </li>
              </ol>
            </div>
          </div>
        </main>
      </div>

      {/* Live Widget Demo */}
      <EmbeddableWidget
        key={`${theme}-${position}`}
        botId="demo"
        theme={theme}
        position={position}
        title="ChatFlow Demo"
        subtitle="AI-powered assistant"
        welcomeMessage="Hi! 👋 I'm a demo of the ChatFlow widget. Try asking me anything!"
      />
    </>
  );
};

export default WidgetDemo;
