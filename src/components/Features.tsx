import { Card } from "./ui/card";
import { Clock, Edit, Layout, Smartphone } from "lucide-react";

const features = [
  {
    icon: Edit,
    title: "Easy Editing",
    description: "Update prices and menu items in real-time with our intuitive interface",
  },
  {
    icon: Layout,
    title: "Category Management",
    description: "Organize your menu with custom categories and sections",
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Changes reflect instantly across all your digital platforms",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Manage your menu from any device, anywhere, anytime",
  },
];

export const Features = () => {
  return (
    <section className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features to help you manage your menu efficiently
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 glass-card hover-lift fade-in">
              <feature.icon className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};