import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import ChatWidget from "./ChatWidget";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.1] text-foreground animate-fade-in tracking-tight">
              AI agents for
              <span className="block">magical customer</span>
              <span className="block">experiences</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
              ChatFlow is the complete platform for building & 
              deploying AI support agents for your business.
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Button variant="hero" size="lg">
                Build your agent
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                <span>No credit card required</span>
              </div>
            </div>

            <div className="pt-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <p className="text-sm text-muted-foreground mb-4">Trusted by <span className="font-semibold text-foreground">10,000+</span> businesses worldwide</p>
              <div className="flex flex-wrap items-center gap-8 opacity-60">
                {['Sage', 'Miele', 'IHG', 'Opal'].map((brand) => (
                  <span key={brand} className="text-lg font-semibold text-foreground/70">{brand}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Chat Widget */}
          <div className="flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: '400ms' }}>
            <ChatWidget />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
