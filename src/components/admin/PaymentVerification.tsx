
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_type: string;
  verified: boolean;
  verified_by: string | null;
  details: any;
  created_at: string;
}

export const PaymentVerification = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error("Failed to fetch payments:", error);
      toast.error(error.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      console.log("Starting payment verification for id:", id);
      
      // Get admin ID
      const { data: session } = await supabase.auth.getSession();
      console.log("Current session:", session?.session?.user?.email);
      
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", session.session?.user.email)
        .single();

      if (adminError) {
        console.error("Admin lookup error:", adminError);
        toast.error("Admin ID not found");
        return;
      }

      console.log("Admin data:", adminData);

      if (!adminData) {
        toast.error("Admin ID not found");
        return;
      }

      // Get the payment to update subscription
      const { data: paymentData, error: paymentFetchError } = await supabase
        .from("payments")
        .select("*")
        .eq("id", id)
        .single();

      if (paymentFetchError) {
        console.error("Payment fetch error:", paymentFetchError);
        toast.error("Payment not found");
        return;
      }

      console.log("Payment data found:", paymentData);

      if (!paymentData) {
        toast.error("Payment not found");
        return;
      }

      // Update payment status
      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          verified: true,
          verified_by: adminData.id,
          status: "verified"
        })
        .eq("id", id);

      if (paymentError) {
        console.error("Payment update error:", paymentError);
        throw paymentError;
      }

      console.log("Payment updated successfully");

      // Update subscription status
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .update({
          status: "active"
        })
        .eq("payment_id", id);

      if (subscriptionError) {
        console.error("Subscription update error:", subscriptionError);
        throw subscriptionError;
      }

      console.log("Subscription updated successfully");

      // Add audit log
      const auditData = {
        admin_id: adminData.id,
        action: "verify_payment",
        resource_type: "payments",
        resource_id: id,
        details: { action: "payment_verified" }
      };
      
      console.log("Adding audit log:", auditData);
      
      const { error: auditError } = await supabase
        .from("audit_logs")
        .insert(auditData);

      if (auditError) {
        console.error("Audit log error:", auditError);
      }

      toast.success("Payment verified successfully");
      fetchPayments();
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
      
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", session.session?.user.email)
        .single();

      if (adminError) {
        console.error("Admin lookup error:", adminError);
        toast.error("Admin ID not found");
        return;
      }

      console.log("Admin data:", adminData);

      if (!adminData) {
        toast.error("Admin ID not found");
        return;
      }

      // Update payment status
      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          verified: false,
          verified_by: adminData.id,
          status: "rejected"
        })
        .eq("id", id);

      if (paymentError) {
        console.error("Payment update error:", paymentError);
        throw paymentError;
      }

      console.log("Payment updated successfully");

      // Update subscription status - notice we're using the payment_id parameter
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .update({
          status: "rejected"
        })
        .eq("payment_id", id);

      if (subscriptionError) {
        console.error("Subscription update error:", subscriptionError);
        throw subscriptionError;
      }

      console.log("Subscription updated successfully");

      // Add audit log
      const auditData = {
        admin_id: adminData.id,
        action: "reject_payment",
        resource_type: "payments",
        resource_id: id,
        details: { action: "payment_rejected" }
      };
      
      console.log("Adding audit log:", auditData);
      
      const { error: auditError } = await supabase
        .from("audit_logs")
        .insert(auditData);

      if (auditError) {
        console.error("Audit log error:", auditError);
      }

      toast.success("Payment rejected");
      fetchPayments();
    } catch (error: any) {
      console.error("Rejection error details:", error);
      toast.error(error.message || "Failed to reject payment");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Payment Verification</h2>
        <Button onClick={fetchPayments} variant="outline">Refresh</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No payments to verify
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {new Date(payment.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {payment.user_id.slice(0, 8)}...
                </TableCell>
                <TableCell className="font-semibold">${payment.amount}</TableCell>
                <TableCell>{payment.payment_type}</TableCell>
                <TableCell>
                  {payment.details?.has_qr_code && (
                    <Badge variant="success" className="mr-2">QR Code</Badge>
                  )}
                  {payment.details?.plan && (
                    <Badge>{payment.details.plan}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    payment.status === "verified" ? "success" : 
                    payment.status === "rejected" ? "destructive" : 
                    "warning"
                  }>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {payment.status === "pending" && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleVerify(payment.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Verify
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleReject(payment.id)}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
