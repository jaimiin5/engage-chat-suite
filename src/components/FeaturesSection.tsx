import { Bot, Code2, Globe2, BarChart3, Shield, Zap, Puzzle, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Responses",
    description: "Leverage advanced language models to provide intelligent, context-aware responses to your customers.",
  },
  {
    icon: Code2,
    title: "Easy API Integration",
    description: "Simple REST API with comprehensive documentation. Integrate in minutes with any platform.",
  },
  {
    icon: Globe2,
    title: "Embeddable Widget",
    description: "Drop-in chat widget that works on any website. Customize colors, position, and behavior.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track conversations, user satisfaction, and chatbot performance with detailed dashboards.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant with end-to-end encryption. Your data stays private and secure.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-second response times with global edge deployment. Never keep your customers waiting.",
  },
  {
    icon: Puzzle,
    title: "Multi-Platform",
    description: "Works with Slack, Discord, WhatsApp, and more. One chatbot, endless possibilities.",
  },
  {
    icon: MessageCircle,
    title: "Custom Training",
    description: "Train on your own data. Upload documents, FAQs, and knowledge bases for personalized responses.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-foreground font-medium">Highlights</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">
              The complete platform for
              <span className="block">AI support agents</span>
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-md lg:pt-16">
            ChatFlow is designed for building AI support agents that solve your customers' hardest problems while improving business outcomes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.slice(0, 3).map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-3xl bg-card border border-border hover:border-border/80 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-background" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
