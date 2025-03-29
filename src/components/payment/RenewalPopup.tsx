
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase, handleUserExpiry } from "@/lib/supabase";
import { format, addMinutes } from "date-fns";
import { toast } from "sonner";

interface RenewalPopupProps {
  restaurantName: string;
  expiryDate: Date;
  userId: string;
}

// Define a type for the result from handleUserExpiry
interface UserDeletionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const RenewalPopup = ({
  restaurantName,
  expiryDate,
  userId
}: RenewalPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      } else if (now >= gracePeriod && !isDeleting) {
        // If past grace period, delete user and redirect to payment page
        handleUserDeletion();
      }
    };
    
    checkExpiry();
    const interval = setInterval(checkExpiry, 5000);
    return () => clearInterval(interval);
  }, [expiryDate, gracePeriod, navigate, isDeleting]);

  // Function to handle user deletion
  const handleUserDeletion = async () => {
    try {
      // Prevent multiple deletion attempts
      setIsDeleting(true);
      
      console.log(`Grace period expired for user ${userId}. Starting deletion process.`);
      toast.info("Your subscription has expired. Logging out...");
      
      // Sign out the user first
      await supabase.auth.signOut();
      
      // Call the edge function to delete the user
      const result = await handleUserExpiry(userId) as UserDeletionResult;
      
      if (!result.success) {
        console.error("User deletion failed:", result.error);
        toast.error("There was an issue processing your account. Please contact support.");
      } else {
        console.log("User deletion completed:", result);
      }
      
      // Redirect to payment page after deletion process, successful or not
      navigate("/payment");
    } catch (error) {
      console.error("Error processing account expiry:", error);
      toast.error("Error processing account expiry");
      // Still redirect to payment page even if there's an error
      navigate("/payment");
    }
  };

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
