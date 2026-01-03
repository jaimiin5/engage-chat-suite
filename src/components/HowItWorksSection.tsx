import { Settings, Code, Rocket, BarChart } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Settings,
    title: "Configure Your Bot",
    description: "Set up your chatbot's personality, knowledge base, and response behavior through our intuitive dashboard.",
  },
  {
    number: "02",
    icon: Code,
    title: "Integrate Anywhere",
    description: "Add our widget to your website with a single line of code, or use our REST API for custom integrations.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Go Live Instantly",
    description: "Deploy your chatbot with one click. Our global infrastructure ensures fast responses worldwide.",
  },
  {
    number: "04",
    icon: BarChart,
    title: "Analyze & Improve",
    description: "Monitor conversations, gather insights, and continuously improve your bot's performance.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 relative bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-foreground font-medium">Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground">
              Build the perfect customer-facing
              <span className="block">AI agent</span>
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-md lg:pt-16">
            ChatFlow gives you all the tools you need to train your perfect AI agent and connect it to your systems.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group p-8 rounded-3xl bg-card border border-border transition-all duration-300"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mb-6">
                <step.icon className="w-7 h-7 text-background" />
              </div>

              <h3 className="font-display text-xl font-bold mb-3 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
