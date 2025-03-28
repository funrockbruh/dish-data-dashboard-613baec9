
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PaymentTable } from "./PaymentTable";
import { 
  fetchPayments, 
  getAdminId, 
  updatePaymentStatus, 
  getPaymentById,
  updateOrCreateSubscription,
  updateSubscriptionStatus,
  addAuditLog
} from "./PaymentUtils";
import { Payment } from "./types";

export const PaymentVerificationContainer = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    const data = await fetchPayments();
    setPayments(data);
    setLoading(false);
  };

  const handleVerify = async (id: string) => {
    try {
      console.log("Starting payment verification for id:", id);
      
      // Get admin ID
      const { data: session } = await supabase.auth.getSession();
      console.log("Current session:", session?.session?.user?.email);
      
      const adminId = await getAdminId(session.session?.user.email);
      if (!adminId) return;

      // Get the payment to update subscription
      const paymentData = await getPaymentById(id);
      if (!paymentData) {
        toast.error("Payment not found");
        return;
      }

      console.log("Payment data found:", paymentData);

      // Update payment status
      const paymentUpdated = await updatePaymentStatus(id, adminId, "verified");
      if (!paymentUpdated) return;

      // Update or create subscription
      await updateOrCreateSubscription(id, paymentData);

      // Add audit log
      await addAuditLog(adminId, "verify_payment", id);

      toast.success("Payment verified successfully");
      loadPayments();
    } catch (error: any) {
      console.error("Verification error details:", error);
      toast.error(error.message || "Failed to verify payment");
    }
  };

  const handleReject = async (id: string) => {
    try {
      console.log("Starting payment rejection for id:", id);
      
      // Get admin ID
      const { data: session } = await supabase.auth.getSession();
      console.log("Current session:", session?.session?.user?.email);
      
      const adminId = await getAdminId(session.session?.user.email);
      if (!adminId) return;

      // Update payment status
      const paymentUpdated = await updatePaymentStatus(id, adminId, "rejected");
      if (!paymentUpdated) return;

      // Update subscription status if it exists
      await updateSubscriptionStatus(id, "rejected");

      // Add audit log
      await addAuditLog(adminId, "reject_payment", id);

      toast.success("Payment rejected");
      loadPayments();
    } catch (error: any) {
      console.error("Rejection error details:", error);
      toast.error(error.message || "Failed to reject payment");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Payment Verification</h2>
        <Button onClick={loadPayments} variant="outline">Refresh</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <PaymentTable 
          payments={payments} 
          onVerify={handleVerify} 
          onReject={handleReject} 
        />
      )}
    </div>
  );
};
