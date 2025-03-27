
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, Database, RefreshCw, Server, Users } from "lucide-react";

interface SystemStatus {
  id: string;
  component: string;
  status: string;
  details: any;
  created_at: string;
  updated_at: string;
}

interface SystemStats {
  users_count: number;
  restaurants_count: number;
  menu_items_count: number;
  db_size: string;
}

export const SystemMonitoring = () => {
  const [status, setStatus] = useState<SystemStatus[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    users_count: 0,
    restaurants_count: 0,
    menu_items_count: 0,
    db_size: "0 MB"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      // Fetch system status
      const { data: statusData, error: statusError } = await supabase
        .from("system_status")
        .select("*");

      if (statusError) throw statusError;
      setStatus(statusData || []);

      // Get stats
      await fetchStats();
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch system data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Count restaurant profiles
      const { count: restaurantCount, error: restaurantError } = await supabase
        .from("restaurant_profiles")
        .select("*", { count: "exact", head: true });
      
      if (restaurantError) throw restaurantError;

      // Count menu items
      const { count: menuItemsCount, error: menuItemsError } = await supabase
        .from("menu_items")
        .select("*", { count: "exact", head: true });
      
      if (menuItemsError) throw menuItemsError;

      // Set stats with sample data for users_count and db_size
      // In a real app, you'd get these from an Edge Function
      setStats({
        users_count: Math.floor(Math.random() * 100) + 50, // Random sample data
        restaurants_count: restaurantCount || 0,
        menu_items_count: menuItemsCount || 0,
        db_size: `${Math.floor(Math.random() * 500) + 100} MB` // Random sample data
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const updateComponentStatus = async (component: string, status: string) => {
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

      // Check if component exists
      const { data: existingComponent } = await supabase
        .from("system_status")
        .select("id")
        .eq("component", component)
        .maybeSingle();

      if (existingComponent) {
        // Update existing component
        await supabase
          .from("system_status")
          .update({ status })
          .eq("id", existingComponent.id);
      } else {
        // Insert new component
        await supabase
          .from("system_status")
          .insert({ component, status });
      }

      // Add audit log
      await supabase.from("audit_logs").insert({
        admin_id: adminData.id,
        action: "update_system_status",
        resource_type: "system_status",
        resource_id: existingComponent?.id || null,
        details: { component, status }
      });

      toast.success(`${component} status updated to ${status}`);
      fetchSystemData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">System Monitoring</h2>
        <Button 
          onClick={fetchSystemData} 
          variant="outline"
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <div className="text-2xl font-bold">{stats.users_count}</div>
                  <div className="ml-auto flex items-center text-green-500 text-xs">
                    <ChevronUp className="h-3 w-3 mr-1" />
                    12%
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Restaurants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-purple-500 mr-2" />
                  <div className="text-2xl font-bold">{stats.restaurants_count}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Menu Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-orange-500 mr-2" />
                  <div className="text-2xl font-bold">{stats.menu_items_count}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Database Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-green-500 mr-2" />
                  <div className="text-2xl font-bold">{stats.db_size}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">System Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-blue-500 mr-2" />
                  <span>API Services</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusVariant("operational")}>
                    Operational
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => updateComponentStatus("API Services", "operational")}
                  >
                    Update
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-green-500 mr-2" />
                  <span>Database</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusVariant("operational")}>
                    Operational
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => updateComponentStatus("Database", "operational")}
                  >
                    Update
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-purple-500 mr-2" />
                  <span>Authentication</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusVariant("operational")}>
                    Operational
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => updateComponentStatus("Authentication", "operational")}
                  >
                    Update
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-orange-500 mr-2" />
                  <span>Storage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusVariant("operational")}>
                    Operational
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => updateComponentStatus("Storage", "operational")}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function getStatusVariant(status: string) {
  switch (status) {
    case "operational":
      return "success";
    case "degraded":
      return "warning";
    case "outage":
      return "destructive";
    default:
      return "outline";
  }
}
