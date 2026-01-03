import { Button } from "@/components/ui/button";
import { MessageSquare, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-background" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">ChatFlow</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#pricing" className="text-foreground hover:text-foreground/70 transition-colors font-medium">
              Pricing
            </a>
            <a href="#features" className="text-foreground hover:text-foreground/70 transition-colors font-medium">
              Enterprise
            </a>
            <Link to="/widget-demo" className="text-foreground hover:text-foreground/70 transition-colors font-medium">
              Resources
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild><Link to="/auth">Dashboard</Link></Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#pricing" className="text-foreground hover:text-foreground/70 transition-colors py-2 font-medium">
                Pricing
              </a>
              <a href="#features" className="text-foreground hover:text-foreground/70 transition-colors py-2 font-medium">
                Enterprise
              </a>
              <Link to="/widget-demo" className="text-foreground hover:text-foreground/70 transition-colors py-2 font-medium">
                Resources
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="default" className="w-full" asChild>
                  <Link to="/auth">Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
