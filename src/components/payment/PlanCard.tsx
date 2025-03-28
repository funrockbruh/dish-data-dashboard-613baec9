
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlanFeatures, Feature } from "./PlanFeatures";

interface PlanCardProps {
  plan: {
    name: string;
    price: string;
    duration: string;
    description: string;
  };
  features: Feature[];
}

export const PlanCard = ({ plan, features }: PlanCardProps) => {
  return (
    <Card className="p-8 glass-card hover-lift fade-in border-0 hover:shadow-2xl transition-all duration-300 w-full">
      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold gradient-text">${plan.price}</span>
        <span className="text-muted-foreground">/{plan.duration}</span>
      </div>
      <p className="text-muted-foreground mb-6">{plan.description}</p>
      <PlanFeatures features={features} />
      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={true}>
        Selected
      </Button>
    </Card>
  );
};
