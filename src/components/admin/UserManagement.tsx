
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
import { User, UserCheck, UserX, Loader, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const isMobile = useIsMobile();

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

  // Mobile Card View for each user
  const MobileUserCard = ({ user }: { user: UserProfile }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-medium text-sm break-all">{user.email}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {user.restaurant_name || "No restaurant set"}
            </p>
          </div>
          <Badge variant={user.last_sign_in_at ? "success" : "warning"} className="flex items-center gap-1 w-fit ml-2">
            {user.last_sign_in_at ? (
              <>
                <UserCheck className="h-3 w-3" />
                Active
              </>
            ) : (
              "Never logged in"
            )}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Subdomain</p>
            <p className="font-medium">{user.subdomain || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{formatDate(user.created_at).split(',')[0]}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Sign In</p>
            <p className="font-medium">{formatDate(user.last_sign_in_at).split(',')[0]}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-semibold">User Management</h2>
        <Button onClick={fetchUsers} variant="outline" disabled={loading} size={isMobile ? "sm" : "default"}>
          {loading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              <span className="md:inline hidden">Loading...</span>
              <span className="md:hidden">Load</span>
            </>
          ) : (
            <>
              <span className="md:inline hidden">Refresh</span>
              <span className="md:hidden">Refresh</span>
            </>
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
        <>
          {/* Mobile View */}
          <div className="md:hidden">
            {users.map((user) => (
              <MobileUserCard key={user.id} user={user} />
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
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
        </>
      )}
    </div>
  );
};
