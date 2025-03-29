
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format, addMinutes } from "date-fns";
import { toast } from "sonner";

interface RenewalPopupProps {
  restaurantName: string;
  expiryDate: Date;
  userId: string;
}

export const RenewalPopup = ({
  restaurantName,
  expiryDate,
  userId
}: RenewalPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Calculate grace period (5 minutes after expiry)
  const gracePeriod = addMinutes(expiryDate, 5);
  const formattedGracePeriod = format(gracePeriod, "HH:mm");

  useEffect(() => {
    const checkExpiry = async () => {
      const now = new Date();

      // Show popup if current time is past expiry date but before grace period
      if (now > expiryDate && now < gracePeriod) {
        setIsVisible(true);
      } else if (now >= gracePeriod) {
        // If past grace period, delete the user account
        try {
          // Call the edge function to delete the user
          const { data: session } = await supabase.auth.getSession();
          if (!session.session) {
            throw new Error("No authenticated session");
          }

          const response = await fetch(
            `${window.location.origin}/functions/v1/delete-expired-user`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.session.access_token}`
              },
              body: JSON.stringify({ 
                userId,
                reason: "subscription_expiry"
              })
            }
          );
          
          // Check if response is JSON
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Non-JSON response from server");
          }
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || "Failed to delete user account");
          }
          
          // Sign out the user after successful deletion
          await supabase.auth.signOut();
          toast.success("Your account has been deleted due to subscription expiry");
          navigate("/");
        } catch (error) {
          console.error("Failed to process account expiry:", error);
          // Create a fallback deletion request in the payments table
          try {
            await supabase.from("payments").insert({
              user_id: userId,
              amount: 0,
              payment_type: "account_expiry",
              status: "pending",
              details: {
                request_type: "deletion",
                requested_at: new Date().toISOString(),
                reason: "subscription_expiry"
              }
            });
          } catch (fallbackError) {
            console.error("Error creating deletion request:", fallbackError);
          }
          
          // Sign out the user regardless of errors
          await supabase.auth.signOut();
          toast.error("Your account has expired due to payment not being renewed");
          navigate("/");
        }
      }
    };
    
    checkExpiry();
    const interval = setInterval(checkExpiry, 5000);
    
    return () => clearInterval(interval);
  }, [expiryDate, gracePeriod, navigate, userId]);

  const handleRenewalRequest = async () => {
    try {
      setIsLoading(true);

      // Create a renewal request in the payments table
      const {
        error
      } = await supabase.from("payments").insert({
        user_id: userId,
        amount: 100,
        // Default amount, same as original subscription
        payment_type: "renewal_request",
        status: "pending",
        details: {
          request_type: "renewal",
          requested_at: new Date().toISOString(),
          plan: "menu_plan"
        }
      });
      if (error) throw error;
      toast.success("Renewal request submitted successfully");
      // Keep the popup visible but update UI to show request was sent
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending renewal request:", error);
      toast.error("Failed to submit renewal request");
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-black/100 backdrop-blur-[15px] text-white rounded-xl p-8 max-w-sm w-full text-center shadow-2xl border border-white/10 mt-[500px] py-[180px]">
        <h2 className="text-2xl font-bold mb-6">Renewal request</h2>
        
        <div className="mb-6 flex justify-center">
          <AlertTriangle size={56} className="text-yellow-400" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{restaurantName}</h3>
        
        <p className="mb-4 text-gray-300">Has not renewed his subscription</p>
        
        <p className="mb-8 text-gray-300">{restaurantName} has until {formattedGracePeriod}</p>
        
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-medium" onClick={handleRenewalRequest} disabled={isLoading}>
          {isLoading ? "Processing..." : "Ask for Renewal"}
        </Button>
      </div>
    </div>;
};
