
import { User } from "@supabase/supabase-js";

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_type: string;
  verified: boolean;
  verified_by: string | null;
  details: any;
  created_at: string;
}

export interface PaymentVerificationProps {
  payment: Payment;
  onVerify: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}
