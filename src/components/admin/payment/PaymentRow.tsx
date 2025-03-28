
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { Payment, PaymentVerificationProps } from "./types";

interface PaymentRowProps {
  payment: Payment;
  onVerify: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const PaymentRow = ({ payment, onVerify, onReject }: PaymentRowProps) => {
  return (
    <TableRow>
      <TableCell>
        {new Date(payment.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="font-mono text-xs">
        {payment.user_id.slice(0, 8)}...
      </TableCell>
      <TableCell className="font-semibold">${payment.amount}</TableCell>
      <TableCell>{payment.payment_type}</TableCell>
      <TableCell>
        {payment.details?.has_qr_code && (
          <Badge variant="success" className="mr-2">QR Code</Badge>
        )}
        {payment.details?.plan && (
          <Badge>{payment.details.plan}</Badge>
        )}
      </TableCell>
      <TableCell>
        <PaymentStatusBadge status={payment.status} />
      </TableCell>
      <TableCell>
        {payment.status === "pending" && (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => onVerify(payment.id)}
            >
              <Check className="h-4 w-4 mr-1" /> Verify
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => onReject(payment.id)}
            >
              <X className="h-4 w-4 mr-1" /> Reject
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};
