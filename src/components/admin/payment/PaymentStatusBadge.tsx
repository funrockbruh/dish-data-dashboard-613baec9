
import { Badge } from "@/components/ui/badge";

interface PaymentStatusBadgeProps {
  status: string;
}

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const variant = 
    status === "verified" ? "success" : 
    status === "rejected" ? "destructive" : 
    "warning";
  
  return <Badge variant={variant}>{status}</Badge>;
};
