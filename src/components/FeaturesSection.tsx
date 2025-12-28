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
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6">
            Everything You Need to Build
            <span className="gradient-text"> Amazing Chatbots</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From simple FAQ bots to complex AI assistants, our platform provides all the tools you need.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
