import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "29",
    description: "Perfect for small restaurants",
    features: [
      "Up to 50 menu items",
      "Basic categories",
      "Real-time updates",
      "Mobile access",
    ],
  },
  {
    name: "Professional",
    price: "79",
    description: "Ideal for growing businesses",
    features: [
      "Unlimited menu items",
      "Advanced categories",
      "Priority support",
      "Analytics dashboard",
      "Multiple locations",
    ],
  },
];

export const Pricing = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your business
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className="p-8 glass-card hover-lift fade-in">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full hover-lift">Get Started</Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};