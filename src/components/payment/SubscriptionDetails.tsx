
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface SubscriptionDetailsProps {
  subscription: any;
  renewalDate: Date;
  wantsQrCode: boolean;
  onRefreshHistory: () => void;
}

export const SubscriptionDetails = ({ 
  subscription, 
  renewalDate, 
  wantsQrCode,
  onRefreshHistory 
}: SubscriptionDetailsProps) => {
  const [isSubmittingRenewal, setIsSubmittingRenewal] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatDateTime = (date: Date) => {
    try {
      return format(date, "MMMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  const handleUpdatePaymentMethod = () => {
    toast.info("Payment method update feature coming soon");
  };

  const handleRenewSubscription = async () => {
    try {
      setIsSubmittingRenewal(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Check if there's already a pending renewal request
      const { data: pendingRequests } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
        
      if (pendingRequests && pendingRequests.length > 0) {
        toast.info("You already have a pending renewal request");
        setIsSubmittingRenewal(false);
        return;
      }
      
      // Create a new payment entry as a renewal request
      const paymentDetails = {
        user_id: userId,
        amount: 100, // Standard renewal amount
        payment_type: subscription?.payment_type || "cash",
        status: "pending",
        details: {
          plan: subscription?.plan || "menu_plan",
          has_qr_code: wantsQrCode,
          renewal_request: true
        }
      };
      
      const { error } = await supabase.from("payments").insert(paymentDetails);
      
      if (error) throw error;
      
      toast.success("Renewal request submitted successfully");
      onRefreshHistory();
    } catch (error) {
      console.error("Error submitting renewal request:", error);
      toast.error("Failed to submit renewal request");
    } finally {
      setIsSubmittingRenewal(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Subscription Details</h2>
        <Badge className={subscription?.status === "active" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}>
          {subscription?.status === "active" ? "Active" : "Verified"}
        </Badge>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Subscribed On</p>
          <p className="font-medium">{subscription?.start_date ? formatDate(subscription.start_date) : "Recent"}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Next Renewal</p>
          <div className="flex items-center justify-between">
            <p className="font-medium">
              {subscription?.end_date ? formatDate(subscription.end_date) : formatDateTime(renewalDate)}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
              onClick={handleRenewSubscription}
              disabled={isSubmittingRenewal}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isSubmittingRenewal ? "animate-spin" : ""}`} />
              {isSubmittingRenewal ? "Submitting..." : "Renew"}
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-600 text-sm mb-2">Payment Method</p>
          <div className="flex items-center">
            <div className="bg-blue-500 text-white p-2 rounded mr-3">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="font-medium">
              {subscription?.payment_type ? `Pay in ${subscription.payment_type}` : "Cash"}
            </span>
          </div>
          <button onClick={handleUpdatePaymentMethod} className="text-purple-600 font-medium mt-2 flex items-center">
            Update <span className="ml-1">↓</span>
          </button>
        </div>
      </div>
    </div>
  );
};
