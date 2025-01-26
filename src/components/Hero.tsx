import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-4 hero-gradient">
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="container mx-auto text-center z-10 fade-in">
        <span className="inline-block px-4 py-1.5 text-sm font-medium bg-white/50 backdrop-blur-sm rounded-full mb-6 border border-gray-200/50">
          Transform Your Menu Management
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          Your Digital Menu,{" "}
          <span className="gradient-text">Simplified</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Create, edit, and manage your restaurant's menu with ease. Update prices, add items, and organize categories in real-time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="hover-lift bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
            Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="hover-lift backdrop-blur-sm bg-white/50">
            View Demo
          </Button>
        </div>
      </div>
    </section>
  );
};