
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface QrCodeToggleProps {
  wantsQrCode: boolean;
  onToggleQrCode: (value: boolean) => void;
  billingHistory: any[];
}

export const QrCodeToggle = ({ wantsQrCode, onToggleQrCode, billingHistory }: QrCodeToggleProps) => {
  const handleToggleQrCode = async (value: boolean) => {
    onToggleQrCode(value);
    try {
      // Update the latest payment's details with QR code preference
      if (billingHistory.length > 0 && billingHistory[0].status === "verified") {
        const latestPayment = billingHistory[0];
        const updatedDetails = {
          ...latestPayment.details,
          has_qr_code: value
        };
        const { error } = await supabase.from("payments").update({
          details: updatedDetails
        }).eq("id", latestPayment.id);
        
        if (error) throw error;
        toast.success(value ? "QR code enabled" : "QR code disabled");
      } else {
        toast.info(value ? "QR code will be enabled after payment is verified" : "QR code disabled");
      }
    } catch (error) {
      console.error("Error updating QR code preference:", error);
      toast.error("Failed to update QR code preference");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
      <h2 className="text-lg font-medium mb-4">Do you want a unique QR code?</h2>
      
      <div className="flex space-x-4">
        <Button 
          variant={!wantsQrCode ? "default" : "outline"} 
          className={!wantsQrCode ? "bg-white border-2 border-gray-200 text-black" : ""} 
          onClick={() => handleToggleQrCode(false)}
        >
          No
        </Button>
        <Button 
          variant={wantsQrCode ? "default" : "outline"} 
          className={wantsQrCode ? "bg-white border-2 border-gray-200 text-black" : ""} 
          onClick={() => handleToggleQrCode(true)}
        >
          Yes
        </Button>
      </div>
    </div>
  );
};
