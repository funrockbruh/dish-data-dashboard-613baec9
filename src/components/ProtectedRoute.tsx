
import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasVerifiedSubscription, setHasVerifiedSubscription] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          navigate("/");
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // First check for verified payments
        const { data: verifiedPayments, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "verified")
          .limit(1);
          
        if (!paymentsError && verifiedPayments && verifiedPayments.length > 0) {
          setHasVerifiedSubscription(true);
          
          // Check if the user is on the payment page and redirect to setup
          const currentPath = window.location.pathname;
          if (currentPath === "/payment") {
            navigate("/setup");
            return;
          }
          
          return;
        }
        
        try {
          // Check if user has a verified subscription
          const { data: subscriptions, error } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "active")
            .limit(1);
          
          if (error) {
            console.error("Error checking subscription:", error);
            
            // If there's a permission error with the subscriptions table, 
            // the verified payments check would have already succeeded if they have one
            if (error.code === '42501') {
              if (verifiedPayments && verifiedPayments.length > 0) {
                // User has a verified payment but subscription table has permission issues
                setHasVerifiedSubscription(true);
                toast.info("You have a verified payment. Using temporary access until system is updated.");
                return;
              }
            }
            
            toast.error("Error checking subscription status");
            return;
          }
          
          if (subscriptions && subscriptions.length > 0) {
            setHasVerifiedSubscription(true);
            
            // Check if the user is on the payment page and redirect to setup
            const currentPath = window.location.pathname;
            if (currentPath === "/payment") {
              navigate("/setup");
              return;
            }
          } else {
            // Check if the user has a pending payment
            const { data: pendingPayments } = await supabase
              .from("payments")
              .select("*")
              .eq("user_id", userId)
              .eq("status", "pending")
              .limit(1);
              
            if (pendingPayments && pendingPayments.length > 0) {
              // User has pending payment but not verified yet
              toast.info("Your payment is pending verification by an admin");
              navigate("/payment/pending");
            } else {
              // No subscription, verified payment, or pending payment found
              toast.error("Please subscribe to a plan to access this content");
              navigate("/payment");
            }
          }
        } catch (err) {
          console.error("Subscription check error:", err);
          toast.error("Error checking subscription status");
        }
      } catch (err) {
        console.error("Protected route error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-t-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasVerifiedSubscription) {
    return <Navigate to="/payment/pending" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
