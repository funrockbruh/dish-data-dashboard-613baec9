
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
        
        // Check if user has a verified subscription
        const { data: subscriptions, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .limit(1);
        
        if (error) {
          console.error("Error checking subscription:", error);
          toast.error("Error checking subscription status");
          return;
        }
        
        if (subscriptions && subscriptions.length > 0) {
          setHasVerifiedSubscription(true);
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
          } else {
            // No subscription or pending payment found
            toast.error("Please subscribe to a plan to access this content");
            navigate("/payment");
          }
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
