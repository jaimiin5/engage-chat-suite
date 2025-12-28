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
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6">
            Launch Your Chatbot in
            <span className="gradient-text"> 4 Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From setup to deployment, get your AI chatbot running in under an hour.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent -translate-y-1/2" />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Card */}
                <div className="p-6 rounded-2xl bg-card border border-border group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/5">
                  {/* Number Badge */}
                  <div className="absolute -top-4 left-6 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-sm font-bold text-primary-foreground">
                    {step.number}
                  </div>

                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mt-2 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>

                  <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
