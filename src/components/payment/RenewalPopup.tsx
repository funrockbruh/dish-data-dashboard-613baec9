
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
          // Create a deletion request in the payments table
          const {
            error: requestError
          } = await supabase.from("payments").insert({
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
          
          if (requestError) {
            console.error("Error creating deletion request:", requestError);
          }
          
          // Sign out the user regardless of whether the deletion request was successful
          await supabase.auth.signOut();
          toast.error("Your account has expired due to payment not being renewed");
          navigate("/");
        } catch (error) {
          console.error("Failed to process account expiry:", error);
          // Fallback: just sign out the user if any errors occur
          await supabase.auth.signOut();
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
