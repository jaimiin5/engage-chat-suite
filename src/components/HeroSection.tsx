import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import ChatWidget from "./ChatWidget";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">AI-Powered Conversations</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
              Build Smarter
              <span className="block gradient-text">AI Chatbots</span>
              for Your Business
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
              Create, deploy, and scale intelligent chatbots in minutes. 
              Integrate with any platform using our simple API or embeddable widget.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Button variant="hero" size="xl">
                Start Building Free
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 border-2 border-background"
                  />
                ))}
              </div>
              <div>
                <p className="font-semibold">10,000+</p>
                <p className="text-sm text-muted-foreground">Happy Businesses</p>
              </div>
            </div>
          </div>

          {/* Right Content - Chat Widget */}
          <div className="flex justify-center lg:justify-end animate-fade-in floating-animation" style={{ animationDelay: '500ms' }}>
            <ChatWidget />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
