
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
import { Badge } from "@/components/ui/badge";

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  start_date: string;
  end_date: string;
  price: number;
  created_at: string;
}

export const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (id: string) => {
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

      // Update subscription status
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;

      // Add audit log
      await supabase.from("audit_logs").insert({
        admin_id: adminData.id,
        action: "cancel_subscription",
        resource_type: "subscriptions",
        resource_id: id,
        details: { action: "subscription_cancelled" }
      });

      toast.success("Subscription cancelled");
      fetchSubscriptions();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel subscription");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Subscription Management</h2>
        <Button onClick={fetchSubscriptions} variant="outline">Refresh</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No subscriptions found
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell className="font-mono text-xs">
                  {subscription.user_id}
                </TableCell>
                <TableCell>
                  <span className="capitalize">{subscription.plan}</span>
                </TableCell>
                <TableCell>
                  {new Date(subscription.start_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(subscription.end_date).toLocaleDateString()}
                </TableCell>
                <TableCell>${subscription.price}</TableCell>
                <TableCell>
                  <Badge variant={
                    subscription.status === "active" ? "success" : 
                    subscription.status === "expired" ? "destructive" : 
                    "outline"
                  }>
                    {subscription.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {subscription.status === "active" && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleCancelSubscription(subscription.id)}
                    >
                      Cancel
                    </Button>
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
