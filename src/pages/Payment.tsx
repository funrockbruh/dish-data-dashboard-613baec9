
import { useIsMobile } from "@/hooks/use-mobile";
import { Navigation } from "@/components/Navigation";
import { PlanCard } from "@/components/payment/PlanCard";
import { PaymentMethods } from "@/components/payment/PaymentMethods";
import { PaymentConfirmation } from "@/components/payment/PaymentConfirmation";
import { usePayment } from "@/hooks/use-payment";
import { Feature } from "@/components/payment/PlanFeatures";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Payment = () => {
  const {
    isLoading,
    hasQRCode,
    paymentMethod,
    currentPrice,
    paymentSubmitted,
    errorInfo,
    handlePaymentSelect,
    toggleQRCode
  } = usePayment();
  
  const isMobile = useIsMobile();

  const features: Feature[] = [
    "Unlimited menu items", 
    "Advanced categories", 
    "Priority support", 
    "Mobile-friendly design", 
    "Real-time updates", 
    {
      label: "Custom branding",
      selectable: false
    }, 
    {
      label: "Unique QR code",
      selectable: true,
      selected: hasQRCode,
      onToggle: toggleQRCode
    }
  ];

  const plan = {
    name: "Menu Plan",
    price: currentPrice.toString(),
    duration: "2 minutes",
    description: "Quick test plan for your restaurant menu"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-purple-50/50">
      <Navigation />
      <main className={`pt-20 pb-16 px-4 ${isMobile ? 'pb-36' : ''}`}>
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground">Select a subscription plan to continue</p>
          </div>

          {/* Debug Information */}
          {errorInfo && (
            <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2 flex items-center">
                <Badge variant="outline" className="bg-amber-100 text-amber-800 mr-2">DEBUG</Badge>
                Error Information
              </h3>
              <div className="bg-amber-100 p-3 rounded text-amber-900 font-mono text-sm overflow-auto max-h-40">
                <pre>{JSON.stringify(errorInfo, null, 2)}</pre>
              </div>
            </Card>
          )}

          {paymentSubmitted ? (
            <PaymentConfirmation 
              planName={plan.name}
              paymentMethod={paymentMethod}
              currentPrice={currentPrice}
              hasQRCode={hasQRCode}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="md:col-span-2">
                <PlanCard plan={plan} features={features} />
              </div>

              {!isMobile && (
                <div className="md:col-span-1">
                  <div className="sticky top-24">
                    <PaymentMethods 
                      handlePaymentSelect={handlePaymentSelect}
                      isLoading={isLoading}
                      paymentMethod={paymentMethod}
                      paymentSubmitted={paymentSubmitted}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {isMobile && !paymentSubmitted && (
        <PaymentMethods 
          handlePaymentSelect={handlePaymentSelect}
          isLoading={isLoading}
          paymentMethod={paymentMethod}
          paymentSubmitted={paymentSubmitted}
        />
      )}
    </div>
  );
};

export default Payment;
