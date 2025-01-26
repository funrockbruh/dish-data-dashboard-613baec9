import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-transparent" />
      <div className="container mx-auto text-center z-10 fade-in">
        <span className="inline-block px-3 py-1 text-sm font-medium bg-secondary rounded-full mb-6">
          Transform Your Menu Management
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          Your Digital Menu,{" "}
          <span className="text-primary">Simplified</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Create, edit, and manage your restaurant's menu with ease. Update prices, add items, and organize categories in real-time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="hover-lift">
            Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="hover-lift">
            View Demo
          </Button>
        </div>
      </div>
    </section>
  );
};