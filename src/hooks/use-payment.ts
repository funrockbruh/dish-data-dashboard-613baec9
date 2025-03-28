
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasQRCode, setHasQRCode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState(100);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const navigate = useNavigate();

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
        
        // Check for active subscription using the RLS policy
        try {
          const {
            data: subscriptionData,
            error
          } = await supabase
            .from("subscriptions")
            .select("*")
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
        } catch (err) {
          console.error("Subscription check error:", err);
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

      // Create subscription record without getting payment ID
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          plan: "menu_plan",
          price: currentPrice,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          status: "pending",
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

  return {
    isLoading,
    hasSubscription,
    hasQRCode,
    paymentMethod,
    currentPrice,
    paymentSubmitted,
    handlePaymentSelect,
    toggleQRCode
  };
};
