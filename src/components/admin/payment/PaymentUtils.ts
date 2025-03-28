
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Payment } from "./types";

export async function fetchPayments(): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Failed to fetch payments:", error);
    toast.error(error.message || "Failed to fetch payments");
    return [];
  }
}

export async function getAdminId(email: string | undefined): Promise<string | null> {
  if (!email) {
    toast.error("Admin email not found");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Admin lookup error:", error);
      toast.error("Admin ID not found");
      return null;
    }

    return data?.id || null;
  } catch (error: any) {
    console.error("Error getting admin ID:", error);
    return null;
  }
}

export async function updatePaymentStatus(
  id: string,
  adminId: string,
  status: "verified" | "rejected"
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("payments")
      .update({
        verified: status === "verified",
        verified_by: adminId,
        status: status
      })
      .eq("id", id);

    if (error) {
      console.error(`Payment ${status} update error:`, error);
      throw error;
    }

    console.log(`Payment ${status} successfully`);
    return true;
  } catch (error: any) {
    console.error(`Payment ${status} error:`, error);
    return false;
  }
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Payment fetch error:", error);
      return null;
    }

    return data;
  } catch (error: any) {
    console.error("Error getting payment:", error);
    return null;
  }
}

export async function updateOrCreateSubscription(
  paymentId: string,
  paymentData: Payment
): Promise<boolean> {
  try {
    // Find existing subscription by payment_id
    const { data: subscriptions, error: findError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("payment_id", paymentId);
      
    if (findError) {
      console.error("Error finding subscription:", findError);
      throw findError;
    }
    
    if (subscriptions && subscriptions.length > 0) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ status: "active" })
        .eq("id", subscriptions[0].id);

      if (updateError) {
        console.error("Subscription update error:", updateError);
        throw updateError;
      }
      
      console.log("Subscription updated successfully");
    } else {
      // Create new subscription
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      const { error: createError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: paymentData.user_id,
          payment_id: paymentId,
          plan: paymentData.details?.plan || "default_plan",
          price: paymentData.amount,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          status: "active"
        });
        
      if (createError) {
        console.error("Error creating subscription:", createError);
        throw createError;
      }
      
      console.log("New subscription created successfully");
    }
    
    return true;
  } catch (error) {
    console.error("Subscription update/create error:", error);
    return false;
  }
}

export async function updateSubscriptionStatus(
  paymentId: string,
  status: "active" | "rejected"
): Promise<boolean> {
  try {
    const { data: subscriptions, error: findError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("payment_id", paymentId);
      
    if (findError) {
      console.error("Error finding subscription:", findError);
      throw findError;
    }
    
    if (subscriptions && subscriptions.length > 0) {
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ status })
        .eq("id", subscriptions[0].id);

      if (updateError) {
        console.error("Subscription update error:", updateError);
        throw updateError;
      }
      
      console.log("Subscription updated successfully");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Subscription update error:", error);
    return false;
  }
}

export async function addAuditLog(
  adminId: string,
  action: string,
  resourceId: string
): Promise<boolean> {
  try {
    const auditData = {
      admin_id: adminId,
      action,
      resource_type: "payments",
      resource_id: resourceId,
      details: { action }
    };
    
    console.log("Adding audit log:", auditData);
    
    const { error } = await supabase
      .from("audit_logs")
      .insert(auditData);

    if (error) {
      console.error("Audit log error:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error adding audit log:", error);
    return false;
  }
}
