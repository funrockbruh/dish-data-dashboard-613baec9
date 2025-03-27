
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
import { User, UserCheck, UserX, Loader } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  last_sign_in_at: string | null;
  created_at: string;
  restaurant_name?: string | null;
  subdomain?: string | null;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      setError(error.message || "Failed to fetch users");
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button onClick={fetchUsers} variant="outline" disabled={loading}>
          {loading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {loading && !error && (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-8 text-red-500">
          <UserX className="h-12 w-12 mb-4 text-red-400" />
          <p className="mb-2">Error loading users</p>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <User className="h-16 w-16 mb-4 text-gray-300" />
          <p className="mb-2">No users found</p>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.restaurant_name || "—"}</TableCell>
                  <TableCell>{user.subdomain || "—"}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                  <TableCell>
                    {user.last_sign_in_at ? (
                      <Badge variant="success" className="flex items-center gap-1 w-fit">
                        <UserCheck className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="flex items-center gap-1 w-fit">
                        Never logged in
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
