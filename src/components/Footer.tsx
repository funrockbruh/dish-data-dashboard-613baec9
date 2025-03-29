
import { Button } from "./ui/button";
import { toast } from "sonner";

export const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleComingSoon = () => {
    toast.info("Coming soon! This feature is under development.");
  };

  return <footer className="bg-secondary py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Product</h4>
            <ul className="space-y-2">
              <li>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => scrollToSection("features-section")}
                >
                  Features
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => scrollToSection("pricing-section")}
                >
                  Pricing
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={handleComingSoon}
                >
                  Demo
                </Button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Company</h4>
            <ul className="space-y-2">
              <li>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={handleComingSoon}
                >
                  About
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={handleComingSoon}
                >
                  Blog
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={handleComingSoon}
                >
                  Careers
                </Button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <ul className="space-y-2">
              <li>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={handleComingSoon}
                >
                  Help Center
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={handleComingSoon}
                >
                  Contact
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={handleComingSoon}
                >
                  Privacy
                </Button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Get Started</h4>
            <p className="text-muted-foreground">
              Ready to transform your menu management?
            </p>
            <Button className="hover-lift">Get started</Button>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
          <p>© 2025 Websitely. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};
