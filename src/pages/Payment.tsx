
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

type Feature = string | {
  label: string;
  selectable: boolean;
  selected?: boolean;
  onToggle?: () => void;
};

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasQRCode, setHasQRCode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState(100);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: sessionData
        } = await supabase.auth.getSession();
        if (!sessionData.session) {
          navigate("/");
          return;
        }
        
        // Check for active subscription - using maybeSingle to avoid errors
        const {
          data: subscriptionData,
          error
        } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", sessionData.session.user.id)
          .eq("status", "active")
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Subscription check error:", error);
          return;
        }
        
        if (subscriptionData) {
          setHasSubscription(true);
          toast.info("You already have an active subscription");
          navigate("/setup");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    setCurrentPrice(hasQRCode ? 149 : 100);
  }, [hasQRCode]);

  const handlePaymentSelect = async (method: string) => {
    try {
      setIsLoading(true);
      setPaymentMethod(method);
      
      if (method === 'whish') {
        toast.info("Whish Pay integration coming soon!");
        setIsLoading(false);
        return;
      }

      const {
        data: sessionData
      } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Please sign in to subscribe");
        setIsLoading(false);
        return;
      }

      // Create payment record - don't use select() 
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: sessionData.session.user.id,
          amount: currentPrice,
          payment_type: method,
          status: "pending",
          details: {
            has_qr_code: hasQRCode,
            plan: "menu_plan"
          }
        });

      if (paymentError) {
        console.error("Payment creation error:", paymentError);
        toast.error("Failed to create payment record");
        setIsLoading(false);
        return;
      }

      // Get the just-created payment's ID to link with the subscription
      const { data: paymentData, error: fetchError } = await supabase
        .from("payments")
        .select("id")
        .eq("user_id", sessionData.session.user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Payment fetch error:", fetchError);
      }

      // Create subscription record with payment_id link
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: sessionData.session.user.id,
          plan: "menu_plan",
          price: currentPrice,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          status: "pending",
          payment_id: paymentData?.id || null,
          details: {
            payment_method: method,
            has_qr_code: hasQRCode
          }
        });
      
      if (subscriptionError) {
        console.error("Subscription creation error:", subscriptionError);
        toast.error("Failed to create subscription");
        setIsLoading(false);
        return;
      }
      
      toast.success("Payment submitted for verification!");
      setPaymentSubmitted(true);
      
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQRCode = () => {
    setHasQRCode(!hasQRCode);
  };

  const features: Feature[] = ["Unlimited menu items", "Advanced categories", "Priority support", "Mobile-friendly design", "Real-time updates", {
    label: "Custom branding",
    selectable: false
  }, {
    label: "Unique QR code",
    selectable: true,
    selected: hasQRCode,
    onToggle: toggleQRCode
  }];

  const plan = {
    name: "Menu Plan",
    price: currentPrice.toString(),
    duration: "2 minutes",
    description: "Quick test plan for your restaurant menu"
  };

  const renderFeature = (feature: Feature, index: number) => {
    if (typeof feature === 'string') {
      return <li key={index} className="flex items-center">
          <div className="p-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mr-2">
            <Check className="h-4 w-4 text-white" />
          </div>
          <span>{feature}</span>
        </li>;
    } else {
      return <li key={index} className="flex items-center">
          {feature.selectable ? <div className={`p-1 rounded-full ${feature.selected ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'border border-gray-300'} mr-2 cursor-pointer`} onClick={feature.onToggle}>
              {feature.selected ? <Check className="h-4 w-4 text-white" /> : <Circle className="h-4 w-4 text-gray-300" />}
            </div> : <div className="p-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mr-2">
              <Check className="h-4 w-4 text-white" />
            </div>}
          <span>{feature.label}</span>
        </li>;
    }
  };

  const PaymentMethods = () => <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 shadow-lg px-4 py-3 z-50 rounded-t-2xl' : 'bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-md mb-6'}`}>
      <div className="space-y-3">
        {!isMobile && <h3 className="text-lg font-medium mb-2">Payment Methods</h3>}
        <Button className="w-full bg-green-500 hover:bg-green-600 text-white h-12" onClick={() => handlePaymentSelect('cash')} disabled={isLoading || paymentSubmitted}>
          {isLoading && paymentMethod === 'cash' ? "Processing..." : "Pay in Cash"}
        </Button>
        
        <Button onClick={() => handlePaymentSelect('whish')} disabled={isLoading || paymentSubmitted} className="w-full bg-rose-600 hover:bg-rose-700 text-white h-12">
          {isLoading && paymentMethod === 'whish' ? "Processing..." : <>
              <img alt="Whish logo" src="/lovable-uploads/b718db26-08e1-484c-ad5c-463495cce89b.png" className="h-12 mr--1 object-fill" /> 
              Whish Pay
            </>}
        </Button>
      </div>
    </div>;

  return <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-purple-50/50">
      <Navigation />
      <main className={`pt-20 pb-16 px-4 ${isMobile ? 'pb-36' : ''}`}>
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground">Select a subscription plan to continue</p>
          </div>

          {paymentSubmitted ? (
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <div className="border border-gray-200 rounded-full p-3 flex justify-between items-center bg-white mb-8">
                  <span className="font-medium text-lg pl-3">{plan.name}</span>
                  <Badge variant="outline" className="bg-orange-100 text-orange-500 border-orange-200">
                    Pending
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Your payment is pending approval. You'll receive access to your subscription once confirmed.
                  </p>
                  <p className="text-sm text-muted-foreground mb-8">
                    Payment method: <span className="font-medium">{paymentMethod === 'cash' ? 'Cash' : 'Whish Pay'}</span>
                    <br />
                    Amount: <span className="font-medium">${currentPrice}</span>
                    {hasQRCode && <><br />Including QR code feature</>}
                  </p>
                  <Button onClick={() => navigate("/setup")} className="bg-blue-600 hover:bg-blue-700">
                    Continue to Setup
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="md:col-span-2">
                <Card className="p-8 glass-card hover-lift fade-in border-0 hover:shadow-2xl transition-all duration-300 w-full">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold gradient-text">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.duration}</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {features.map((feature, i) => renderFeature(feature, i))}
                  </ul>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={true}>
                    Selected
                  </Button>
                </Card>
              </div>

              {!isMobile && <div className="md:col-span-1">
                  <div className="sticky top-24">
                    <PaymentMethods />
                  </div>
                </div>}
            </div>
          )}
        </div>
      </main>
      
      {isMobile && !paymentSubmitted && <PaymentMethods />}
    </div>;
};

export default Payment;
