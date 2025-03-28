
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SubscriptionDetails } from "@/components/payment/SubscriptionDetails";
import { PlanCard } from "@/components/payment/PlanCard";
import { QrCodeToggle } from "@/components/payment/QrCodeToggle";
import { BillingHistory } from "@/components/payment/BillingHistory";
import { NoSubscription } from "@/components/payment/NoSubscription";
import { useSubscriptionData } from "@/hooks/useSubscriptionData";

const PaymentManagement = () => {
  const navigate = useNavigate();
  const { 
    subscription, 
    isLoading, 
    wantsQrCode, 
    setWantsQrCode, 
    billingHistory,
    testRenewalDate,
    handleCancelSubscription,
    fetchSubscriptionData
  } = useSubscriptionData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-t-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const hasActiveSubscription = subscription || (billingHistory.length > 0 && billingHistory.some(payment => payment.status === "verified"));
  
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Payment Management</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6">
        {hasActiveSubscription ? (
          <>
            <SubscriptionDetails 
              subscription={subscription} 
              renewalDate={testRenewalDate}
              wantsQrCode={wantsQrCode}
              onRefreshHistory={fetchSubscriptionData}
            />
            
            <PlanCard />
            
            <QrCodeToggle 
              wantsQrCode={wantsQrCode} 
              onToggleQrCode={setWantsQrCode}
              billingHistory={billingHistory}
            />
            
            <BillingHistory 
              billingHistory={billingHistory}
              subscriptionId={subscription?.id}
              onCancelSubscription={handleCancelSubscription}
            />
          </>
        ) : (
          <NoSubscription />
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;
