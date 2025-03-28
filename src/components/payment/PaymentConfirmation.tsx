
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface PaymentConfirmationProps {
  planName: string;
  paymentMethod: string | null;
  currentPrice: number;
  hasQRCode: boolean;
}

export const PaymentConfirmation = ({ 
  planName, 
  paymentMethod, 
  currentPrice, 
  hasQRCode 
}: PaymentConfirmationProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <div className="border border-gray-200 rounded-full p-3 flex justify-between items-center bg-white mb-8">
          <span className="font-medium text-lg pl-3">{planName}</span>
          <Badge variant="outline" className="bg-orange-100 text-orange-500 border-orange-200">
            Pending
          </Badge>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Your payment is pending approval. You'll receive access to your subscription once confirmed.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Payment method: <span className="font-medium">{paymentMethod === 'cash' ? 'Cash' : 'Whish Pay'}</span>
            <br />
            Amount: <span className="font-medium">${currentPrice}</span>
            {hasQRCode && <><br />Including QR code feature</>}
          </p>
          <Button onClick={() => navigate("/setup")} className="bg-blue-600 hover:bg-blue-700">
            Continue to Setup
          </Button>
        </div>
      </div>
    </div>
  );
};
