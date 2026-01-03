import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 text-background">
            Ready to Transform Your
            <span className="block">Customer Experience?</span>
          </h2>

          <p className="text-lg text-background/70 max-w-2xl mx-auto mb-10">
            Join thousands of businesses using ChatFlow to provide instant, 
            intelligent support to their customers. No credit card required.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button size="xl" className="bg-background text-foreground hover:bg-background/90">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="xl" variant="outline" className="border-background/30 text-background hover:bg-background/10">
              Schedule a Demo
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-background/60">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              Cancel anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
