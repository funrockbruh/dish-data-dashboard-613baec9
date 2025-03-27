import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, CircleDot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasQRCode, setHasQRCode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        navigate("/");
        return;
      }

      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", sessionData.session.user.id)
        .eq("status", "active")
        .single();

      if (subscriptionData) {
        setHasSubscription(true);
        toast.info("You already have an active subscription");
        navigate("/setup");
      }
    };

    checkAuth();
  }, [navigate]);

  const handlePaymentSelect = async (method: string) => {
    try {
      setIsLoading(true);
      setPaymentMethod(method);
      
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
        details: {
          payment_method: method,
          has_qr_code: hasQRCode
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-purple-50/50">
      <Navigation />
      <main className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground">Select a subscription plan to continue</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="md:col-span-2">
              <Card 
                className="p-8 glass-card hover-lift fade-in border-0 hover:shadow-2xl transition-all duration-300 w-full"
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold gradient-text">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.duration}</span>
                </div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <div className="p-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mr-2">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={true}
                >
                  Selected
                </Button>
              </Card>
            </div>

            <div className="md:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-md mb-6">
                  <div 
                    className="flex items-center mb-6 cursor-pointer" 
                    onClick={() => setHasQRCode(!hasQRCode)}
                  >
                    <div className={`h-6 w-6 rounded-full mr-3 border flex items-center justify-center ${hasQRCode ? 'border-indigo-600' : 'border-gray-300'}`}>
                      {hasQRCode && <CircleDot className="h-4 w-4 text-indigo-600" />}
                    </div>
                    <span className="font-medium">Unique QR code</span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium mb-2">Payment Methods</h3>
                    <Button 
                      className="w-full bg-green-500 hover:bg-green-600 text-white h-14"
                      onClick={() => handlePaymentSelect('cash')}
                      disabled={isLoading}
                    >
                      {isLoading && paymentMethod === 'cash' ? "Processing..." : "Pay in Cash"}
                    </Button>
                    
                    <Button 
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white h-14"
                      onClick={() => handlePaymentSelect('whish')}
                      disabled={isLoading}
                    >
                      {isLoading && paymentMethod === 'whish' ? "Processing..." : <><span className="mr-2 font-bold">W</span> Whish Pay</>}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
