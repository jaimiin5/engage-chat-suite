import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CodePreviewSection from "@/components/CodePreviewSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>ChatFlow - AI Chatbot Platform for Businesses | Build Smarter Chatbots</title>
        <meta 
          name="description" 
          content="Create, deploy, and scale intelligent AI chatbots in minutes. Integrate with any platform using our simple API or embeddable widget. Start free today." 
        />
        <meta name="keywords" content="AI chatbot, chatbot platform, customer support, chatbot API, chatbot widget, SaaS" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <CodePreviewSection />
          <PricingSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
