
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PaymentVerification } from "@/components/admin/PaymentVerification";
import { SubscriptionManagement } from "@/components/admin/SubscriptionManagement";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemMonitoring } from "@/components/admin/SystemMonitoring";

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      
      // Check if user is logged in
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate("/admin-login");
        return;
      }

      // Check if user is an admin
      const { data: adminData, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", sessionData.session.user.email)
        .maybeSingle();

      if (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        navigate("/admin-login");
        return;
      }

      if (!adminData) {
        setIsAdmin(false);
        navigate("/admin-login");
        return;
      }

      setIsAdmin(true);
      setIsLoading(false);
    };

    checkAdminStatus();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // This shouldn't render as we navigate away
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="mb-6 bg-white p-1 shadow-sm">
              <TabsTrigger value="payments">Payment Verification</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscription Management</TabsTrigger>
              <TabsTrigger value="audit">Audit Logs</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="system">System Monitoring</TabsTrigger>
            </TabsList>
            
            <TabsContent value="payments">
              <PaymentVerification />
            </TabsContent>
            
            <TabsContent value="subscriptions">
              <SubscriptionManagement />
            </TabsContent>
            
            <TabsContent value="audit">
              <AuditLogs />
            </TabsContent>
            
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="system">
              <SystemMonitoring />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminPanel;
