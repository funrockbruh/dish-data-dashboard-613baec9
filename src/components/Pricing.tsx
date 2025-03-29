
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { toast } from "sonner";

const plans = [
  {
    name: "Menu Plan",
    price: "100",
    duration: "2 minutes",
    description: "Quick test plan for your restaurant menu",
    features: [
      "Unlimited menu items",
      "Advanced categories",
      "Priority support",
      "Mobile-friendly design",
      "Real-time updates",
      "Custom branding",
    ],
  },
];

export const Pricing = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error("Please sign in to subscribe");
        return;
      }
      
      const { error } = await supabase.from("subscriptions").insert({
        user_id: sessionData.session.user.id,
        plan: "menu_plan",
        price: 100,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes from now
        status: "active"
      });
      
      if (error) throw error;
      
      toast.success("Successfully subscribed to Menu Plan!");
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="pricing-section" className="py-24 px-4 bg-gradient-to-b from-blue-50/50 to-purple-50/50">
      <div className="container mx-auto">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl font-bold mb-4 gradient-text">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your restaurant menu
          </p>
        </div>
        <div className="flex justify-center">
          <Card 
            className="p-8 glass-card hover-lift fade-in border-0 hover:shadow-2xl transition-all duration-300 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-2">{plans[0].name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold gradient-text">${plans[0].price}</span>
              <span className="text-muted-foreground">/{plans[0].duration}</span>
            </div>
            <p className="text-muted-foreground mb-6">{plans[0].description}</p>
            <ul className="space-y-3 mb-8">
              {plans[0].features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <div className="p-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mr-2">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              className="w-full hover-lift bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Subscribe Now"}
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};
