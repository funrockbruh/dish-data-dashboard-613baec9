
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { addMinutes } from "date-fns";

interface SubscriptionData {
  id: string;
  status: string;
  plan: string;
  start_date: string;
  end_date: string;
  payment_type?: string;
  created_at: string;
}

export const useSubscriptionData = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wantsQrCode, setWantsQrCode] = useState(false);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [testRenewalDate, setTestRenewalDate] = useState(new Date());

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const {
        data: sessionData
      } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate("/");
        return;
      }
      const userId = sessionData.session.user.id;

      // 1. First, check if the user has verified payments
      const {
        data: verifiedPayments,
        error: paymentsError
      } = await supabase.from("payments").select("*").eq("user_id", userId).eq("status", "verified").order("created_at", {
        ascending: false
      });
      if (paymentsError) {
        console.error("Error fetching verified payments:", paymentsError);
        return;
      }
      let hasVerifiedPayment = verifiedPayments && verifiedPayments.length > 0;

      // If verified payment exists, set the test renewal date to 2 minutes after verification
      if (hasVerifiedPayment && verifiedPayments[0]) {
        const verificationDate = new Date(verifiedPayments[0].updated_at || verifiedPayments[0].created_at);
        setTestRenewalDate(addMinutes(verificationDate, 2));
      } else {
        // Fallback to current time + 2 minutes if no verified payment
        setTestRenewalDate(addMinutes(new Date(), 2));
      }

      // 2. Fetch subscriptions if user has verified payments
      if (hasVerifiedPayment) {
        // Try to fetch active subscription
        const {
          data: subscriptionData,
          error: subscriptionError
        } = await supabase.from("subscriptions").select("*").eq("user_id", userId).eq("status", "active").order("created_at", {
            ascending: false
          }).limit(1).single();
        if (subscriptionError) {
          if (subscriptionError.code !== 'PGRST116') {
            // No rows returned
            console.error("Error fetching subscription:", subscriptionError);
          } else {
            // If no active subscription, create one based on verified payment
            const latestPayment = verifiedPayments[0];
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1); // Assuming 1-year subscription

            const subscriptionDetails = {
              user_id: userId,
              payment_id: latestPayment.id,
              plan: latestPayment.details?.plan || "menu_plan",
              price: latestPayment.amount,
              start_date: latestPayment.created_at,
              end_date: endDate.toISOString(),
              status: "active"
            };
            const {
              data: newSubscription,
              error: createError
            } = await supabase.from("subscriptions").insert(subscriptionDetails).select().single();
            if (createError) {
              console.error("Error creating subscription:", createError);
            } else if (newSubscription) {
              setSubscription({
                ...newSubscription,
                payment_type: latestPayment.payment_type
              });
            }
          }
        } else if (subscriptionData) {
          setSubscription(subscriptionData);

          // Look up payment information for this subscription
          if (subscriptionData.payment_id) {
            const {
              data: paymentData
            } = await supabase.from("payments").select("payment_type").eq("id", subscriptionData.payment_id).single();
            if (paymentData) {
              setSubscription({
                ...subscriptionData,
                payment_type: paymentData.payment_type
              });
            }
          }
        }
      }

      // 3. Fetch billing history (all payments for this user)
      const {
        data: paymentsHistory
      } = await supabase.from("payments").select("*").eq("user_id", userId).order("created_at", {
        ascending: false
      });
      if (paymentsHistory) {
        setBillingHistory(paymentsHistory);
      }

      // 4. Set QR code preference based on latest payment
      if (verifiedPayments && verifiedPayments.length > 0) {
        setWantsQrCode(verifiedPayments[0].details?.has_qr_code || false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load subscription information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    try {
      const {
        error
      } = await supabase.from("subscriptions").update({
        status: "cancelled"
      }).eq("id", subscription.id);
      if (error) throw error;
      toast.success("Subscription cancelled successfully");
      setSubscription({
        ...subscription,
        status: "cancelled"
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription");
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [navigate]);

  return {
    subscription,
    isLoading,
    wantsQrCode,
    setWantsQrCode,
    billingHistory,
    testRenewalDate,
    handleCancelSubscription,
    fetchSubscriptionData
  };
};
