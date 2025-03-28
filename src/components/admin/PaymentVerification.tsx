
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
      toast.error(error.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      // Get admin ID
      const { data: session } = await supabase.auth.getSession();
      const { data: adminData } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", session.session?.user.email)
        .single();

      if (!adminData) {
        toast.error("Admin ID not found");
        return;
      }

      // Update payment status
      const { error } = await supabase
        .from("payments")
        .update({
          verified: true,
          verified_by: adminData.id,
          status: "verified"
        })
        .eq("id", id);

      if (error) throw error;

      // Add audit log
      await supabase.from("audit_logs").insert({
        admin_id: adminData.id,
        action: "verify_payment",
        resource_type: "payments",
        resource_id: id,
        details: { action: "payment_verified" }
      });

      toast.success("Payment verified successfully");
      fetchPayments();
    } catch (error: any) {
      toast.error(error.message || "Failed to verify payment");
    }
  };

  const handleReject = async (id: string) => {
    try {
      // Get admin ID
      const { data: session } = await supabase.auth.getSession();
      const { data: adminData } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", session.session?.user.email)
        .single();

      if (!adminData) {
        toast.error("Admin ID not found");
        return;
      }

      // Update payment status
      const { error } = await supabase
        .from("payments")
        .update({
          verified: false,
          verified_by: adminData.id,
          status: "rejected"
        })
        .eq("id", id);

      if (error) throw error;

      // Add audit log
      await supabase.from("audit_logs").insert({
        admin_id: adminData.id,
        action: "reject_payment",
        resource_type: "payments",
        resource_id: id,
        details: { action: "payment_rejected" }
      });

      toast.success("Payment rejected");
      fetchPayments();
    } catch (error: any) {
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
                  {payment.user_id}
                </TableCell>
                <TableCell>${payment.amount}</TableCell>
                <TableCell>{payment.payment_type}</TableCell>
                <TableCell>
                  <Badge variant={
                    payment.status === "verified" ? "success" : 
                    payment.status === "rejected" ? "destructive" : 
                    "outline"
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
