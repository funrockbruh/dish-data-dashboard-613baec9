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
    const checkExpiry = () => {
      const now = new Date();

      // Show popup if current time is past expiry date but before grace period
      if (now > expiryDate && now < gracePeriod) {
        setIsVisible(true);
      } else if (now >= gracePeriod) {
        // If past grace period, redirect to payment page
        navigate("/payment");
      }
    };
    checkExpiry();
    const interval = setInterval(checkExpiry, 5000);
    return () => clearInterval(interval);
  }, [expiryDate, gracePeriod, navigate]);
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
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-black text-white rounded-xl p-6 max-w-xs w-full text-center">
        <h2 className="text-xl font-bold mb-4">Renewal request</h2>
        
        <div className="mb-4 flex justify-center">
          <AlertTriangle size={48} className="text-yellow-400" />
        </div>
        
        <h3 className="text-lg font-semibold mb-1">{restaurantName}</h3>
        
        <p className="mb-4">Has not renewed his subscription</p>
        
        <p className="mb-6">{restaurantName} has until {formattedGracePeriod}</p>
        
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleRenewalRequest} disabled={isLoading}>
          {isLoading ? "Processing..." : "Ask for Renewal"}
        </Button>
      </div>
    </div>;
};