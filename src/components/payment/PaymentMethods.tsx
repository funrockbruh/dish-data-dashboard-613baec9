
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentMethodsProps {
  handlePaymentSelect: (method: string) => Promise<void>;
  isLoading: boolean;
  paymentMethod: string | null;
  paymentSubmitted: boolean;
}

export const PaymentMethods = ({
  handlePaymentSelect,
  isLoading,
  paymentMethod,
  paymentSubmitted
}: PaymentMethodsProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 shadow-lg px-4 py-3 z-50 rounded-t-2xl' : 'bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-md mb-6'}`}>
      <div className="space-y-3">
        {!isMobile && <h3 className="text-lg font-medium mb-2">Payment Methods</h3>}
        <Button 
          className="w-full bg-green-500 hover:bg-green-600 text-white h-12" 
          onClick={() => handlePaymentSelect('cash')} 
          disabled={isLoading || paymentSubmitted}
        >
          {isLoading && paymentMethod === 'cash' ? "Processing..." : "Pay in Cash"}
        </Button>
        
        <Button 
          onClick={() => handlePaymentSelect('whish')} 
          disabled={isLoading || paymentSubmitted} 
          className="w-full bg-rose-600 hover:bg-rose-700 text-white h-12"
        >
          {isLoading && paymentMethod === 'whish' ? "Processing..." : (
            <>
              <img 
                alt="Whish logo" 
                src="/lovable-uploads/b718db26-08e1-484c-ad5c-463495cce89b.png" 
                className="h-12 mr--1 object-fill" 
              /> 
              Whish Pay
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
