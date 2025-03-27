
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
import { User, UserCheck, UserX } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  last_sign_in_at: string;
  created_at: string;
  restaurant_name: string | null;
  subdomain: string | null;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Use Edge Function to get users since we don't have direct access to auth.users
      const { data, error } = await supabase.functions.invoke('get-users');

      if (error) throw error;
      
      // Get restaurant profiles for these users
      if (data && data.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('restaurant_profiles')
          .select('id, restaurant_name, subdomain');
          
        if (profilesError) throw profilesError;
        
        // Merge user data with profile data
        const usersWithProfiles = data.map((user: any) => {
          const profile = profiles?.find(p => p.id === user.id);
          return {
            ...user,
            restaurant_name: profile?.restaurant_name || null,
            subdomain: profile?.subdomain || null
          };
        });
        
        setUsers(usersWithProfiles);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Edge function not implemented yet, so let's show a placeholder
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button onClick={fetchUsers} variant="outline">Refresh</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <User className="h-16 w-16 mb-4 text-gray-300" />
          <p className="mb-2">User management requires an Edge Function</p>
          <p className="text-sm text-gray-400">
            Please create a 'get-users' Edge Function to retrieve user data from Supabase Auth
          </p>
        </div>
      )}
    </div>
  );
};
