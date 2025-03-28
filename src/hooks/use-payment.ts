
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
  const [errorInfo, setErrorInfo] = useState<any>(null);
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
        
        // Check for active subscription with improved error handling
        try {
          console.log("Checking for active subscriptions...");
          const {
            data: subscriptionData,
            error
          } = await supabase
            .from("subscriptions")
            .select("id, plan, status")
            .eq("status", "active")
            .eq("user_id", sessionData.session.user.id)
            .maybeSingle();
          
          if (error) {
            console.error("Subscription check error:", error);
            setErrorInfo(error);
            
            // Only show toast for actual errors, not for "no rows returned"
            if (error.code !== 'PGRST116') {
              toast.error(`Subscription check failed: ${error.message}`);
            }
            return;
          }
          
          if (subscriptionData) {
            setHasSubscription(true);
            toast.info("You already have an active subscription");
            navigate("/setup");
          } else {
            console.log("No active subscription found.");
          }
        } catch (err) {
          console.error("Subscription check error:", err);
          setErrorInfo(err);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setErrorInfo(error);
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

      const userId = sessionData.session.user.id;
      console.log("Creating payment record for user:", userId);

      // Create payment record with explicit user_id
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert({
          amount: currentPrice,
          payment_type: method,
          status: "pending",
          details: {
            has_qr_code: hasQRCode,
            plan: "menu_plan"
          },
          user_id: userId
        })
        .select("id")
        .single();

      if (paymentError) {
        console.error("Payment creation error:", paymentError);
        setErrorInfo(paymentError);
        toast.error(`Failed to create payment record: ${paymentError.message}`);
        setIsLoading(false);
        return;
      }

      console.log("Payment record created:", paymentData);

      // Create subscription record with explicit user_id but without 'details' column
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          plan: "menu_plan",
          price: currentPrice,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          status: "pending",
          user_id: userId,
          payment_id: paymentData?.id || null
        });
      
      if (subscriptionError) {
        console.error("Subscription creation error:", subscriptionError);
        setErrorInfo(subscriptionError);
        toast.error(`Failed to create subscription: ${subscriptionError.message}`);
        setIsLoading(false);
        return;
      }
      
      toast.success("Payment submitted for verification!");
      setPaymentSubmitted(true);
      
    } catch (error) {
      console.error("Payment error:", error);
      setErrorInfo(error);
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
    errorInfo,
    handlePaymentSelect,
    toggleQRCode
  };
};
