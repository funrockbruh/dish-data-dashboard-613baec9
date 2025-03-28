
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Payment } from "./types";
import { PaymentRow } from "./PaymentRow";

interface PaymentTableProps {
  payments: Payment[];
  onVerify: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const PaymentTable = ({ payments, onVerify, onReject }: PaymentTableProps) => {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No payments to verify
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>User ID</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <PaymentRow 
            key={payment.id} 
            payment={payment} 
            onVerify={onVerify} 
            onReject={onReject} 
          />
        ))}
      </TableBody>
    </Table>
  );
};
