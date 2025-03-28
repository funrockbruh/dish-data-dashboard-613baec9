
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
  const [sessionData, setSessionData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get the current session
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setErrorInfo({ source: "Session check", error: sessionError });
          return;
        }

        if (!session.session) {
          console.log("No active session found, redirecting to home");
          navigate("/");
          return;
        }

        // Store session data for debugging and later use
        setSessionData(session);
        
        // Check for active subscription
        try {
          console.log("Checking for active subscriptions...");
          console.log("Current user ID:", session.session.user.id);
          
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from("subscriptions")
            .select("id, plan, status")
            .eq("user_id", session.session.user.id)
            .eq("status", "active")
            .maybeSingle();
          
          if (subscriptionError) {
            console.error("Subscription check error:", subscriptionError);
            setErrorInfo({ 
              source: "Subscription check", 
              error: subscriptionError,
              userId: session.session.user.id 
            });
            
            // Only show toast for actual errors, not for "no rows returned"
            if (subscriptionError.code !== 'PGRST116') {
              toast.error(`Subscription check failed: ${subscriptionError.message}`);
            }
            return;
          }
          
          if (subscriptionData) {
            console.log("Active subscription found:", subscriptionData);
            setHasSubscription(true);
            toast.info("You already have an active subscription");
            navigate("/setup");
          } else {
            console.log("No active subscription found.");
          }
        } catch (err) {
          console.error("Subscription check error:", err);
          setErrorInfo({ source: "Subscription check try/catch", error: err });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setErrorInfo({ source: "Auth check try/catch", error: error });
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

      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setErrorInfo({ source: "Payment session check", error: sessionError });
        toast.error(`Session error: ${sessionError.message}`);
        setIsLoading(false);
        return;
      }

      if (!session.session) {
        toast.error("Please sign in to subscribe");
        setIsLoading(false);
        return;
      }

      const userId = session.session.user.id;
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
        setErrorInfo({ source: "Payment creation", error: paymentError, payload: {
          user_id: userId,
          amount: currentPrice,
          payment_type: method
        }});
        toast.error(`Failed to create payment record: ${paymentError.message}`);
        setIsLoading(false);
        return;
      }

      console.log("Payment record created:", paymentData);

      // Create subscription record with explicit user_id
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
        setErrorInfo({ 
          source: "Subscription creation", 
          error: subscriptionError,
          payload: {
            plan: "menu_plan",
            price: currentPrice,
            user_id: userId,
            payment_id: paymentData?.id
          }
        });
        toast.error(`Failed to create subscription: ${subscriptionError.message}`);
        setIsLoading(false);
        return;
      }
      
      toast.success("Payment submitted for verification!");
      setPaymentSubmitted(true);
      
    } catch (error) {
      console.error("Payment error:", error);
      setErrorInfo({ source: "Payment process try/catch", error });
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
    sessionData,
    handlePaymentSelect,
    toggleQRCode
  };
};
