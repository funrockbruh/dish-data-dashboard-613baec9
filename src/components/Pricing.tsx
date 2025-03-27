import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Check, CircleDot } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const plan = {
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
};

export const Pricing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSelected, setIsSelected] = useState(true);
  const [qrCodeSelected, setQrCodeSelected] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubscribe = async () => {
    if (!isSelected) {
      toast.error("Please select a plan");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

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
        status: "active",
        payment_method: paymentMethod
      });
      
      if (error) throw error;
      
      toast.success("Successfully subscribed to Menu Plan!");
      navigate("/setup");
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="py-24 px-4 bg-gradient-to-b from-blue-50/50 to-purple-50/50">
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
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-orange-500">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.duration}</span>
              </div>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <div className="p-1 rounded-full bg-blue-600 mr-2">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                onClick={() => navigate("/admin-login")}
              >
                Get started
              </Button>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto max-w-md">
        <div className="flex flex-col space-y-6">
          <div className="bg-slate-50 rounded-lg p-5">
            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
            <div className="mb-2">
              <span className="text-2xl font-bold text-orange-500">${plan.price}</span>
              <span className="text-gray-500">/{plan.duration}</span>
            </div>
            <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
            
            <div className="mb-4">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center mb-2">
                  <div className="rounded-full bg-blue-600 p-1 mr-2 flex-shrink-0">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button 
              className={`w-full ${isSelected ? 'bg-blue-600' : 'bg-blue-300'} hover:bg-blue-700 text-white`}
              onClick={() => setIsSelected(true)}
            >
              {isSelected ? "Selected" : "Select"}
            </Button>
          </div>
          
          <div 
            className="flex items-center space-x-3 px-3 py-2 cursor-pointer"
            onClick={() => setQrCodeSelected(!qrCodeSelected)}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${qrCodeSelected ? 'bg-blue-600 border-blue-600' : 'bg-gray-200 border-gray-300'}`}>
              {qrCodeSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
            </div>
            <span className="font-medium">Unique QR code</span>
          </div>
          
          <div className="space-y-3 pt-2">
            <Button 
              className="w-full bg-green-500 hover:bg-green-600 text-white py-6"
              onClick={() => setPaymentMethod('cash')}
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
            >
              Pay in Cash
            </Button>
            
            <Button 
              className="w-full bg-red-500 hover:bg-red-600 text-white py-6"
              onClick={() => setPaymentMethod('whish')}
              variant={paymentMethod === 'whish' ? 'default' : 'outline'}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.5c0 .828-.337 1.5-1.5 1.5s-1.5-.672-1.5-1.5c0-.828.337-1.5 1.5-1.5s1.5.672 1.5 1.5zm-9-7c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5zm-3 7c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5zm-3 0c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5z"/>
              </svg>
              Whish Pay
            </Button>
          </div>
          
          <Button 
            className="w-full mt-4 py-6"
            onClick={handleSubscribe}
            disabled={isLoading || !paymentMethod}
          >
            {isLoading ? "Processing..." : "Subscribe Now"}
          </Button>
        </div>
      </div>
    </section>
  );
};
