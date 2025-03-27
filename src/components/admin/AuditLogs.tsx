
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
import { FileText } from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string | null;
  admin_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: any;
  created_at: string;
}

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Audit Logs</h2>
        <Button onClick={fetchLogs} variant="outline">Refresh</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <FileText className="h-16 w-16 mb-4 text-gray-300" />
          <p>No audit logs found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource Type</TableHead>
              <TableHead>Resource ID</TableHead>
              <TableHead>User/Admin</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="capitalize">
                  {log.action.replace(/_/g, ' ')}
                </TableCell>
                <TableCell className="capitalize">
                  {log.resource_type}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.resource_id?.slice(0, 8) || 'N/A'}...
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.admin_id ? `Admin: ${log.admin_id.slice(0, 8)}...` : 
                   log.user_id ? `User: ${log.user_id.slice(0, 8)}...` : 'System'}
                </TableCell>
                <TableCell>
                  {log.details ? (
                    <pre className="text-xs max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      {JSON.stringify(log.details)}
                    </pre>
                  ) : (
                    <span className="text-gray-500">No details</span>
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
