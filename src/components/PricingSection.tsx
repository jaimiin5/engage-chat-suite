import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started and testing the waters.",
    features: [
      "1 Chatbot",
      "1,000 messages/month",
      "Basic analytics",
      "Widget integration",
      "Community support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For growing businesses that need more power.",
    features: [
      "5 Chatbots",
      "50,000 messages/month",
      "Advanced analytics",
      "API access",
      "Custom branding",
      "Priority support",
      "Integrations",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large organizations with custom requirements.",
    features: [
      "Unlimited Chatbots",
      "Unlimited messages",
      "White-label solution",
      "Custom AI training",
      "Dedicated support",
      "SLA guarantee",
      "SSO & SAML",
      "On-premise option",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 relative bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-foreground font-medium">Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6 text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-3xl border transition-all duration-300 ${
                plan.popular
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card border-border'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-sm font-medium text-background">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-display text-2xl font-bold mb-2 ${plan.popular ? 'text-background' : 'text-foreground'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-background' : 'text-foreground'}`}>{plan.price}</span>
                  <span className={plan.popular ? 'text-background/70' : 'text-muted-foreground'}>/{plan.period}</span>
                </div>
                <p className={`text-sm mt-2 ${plan.popular ? 'text-background/70' : 'text-muted-foreground'}`}>{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex items-center gap-3 text-sm ${plan.popular ? 'text-background' : 'text-foreground'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-background/20' : 'bg-foreground/10'}`}>
                      <Check className={`w-3 h-3 ${plan.popular ? 'text-background' : 'text-foreground'}`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "secondary" : "default"}
                className={`w-full ${plan.popular ? 'bg-background text-foreground hover:bg-background/90' : ''}`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
