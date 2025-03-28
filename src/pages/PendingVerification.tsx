
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";

const PendingVerification = () => {
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          navigate("/");
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // First check for verified payments
        const { data: verifiedPayments } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "verified")
          .limit(1);
          
        if (verifiedPayments && verifiedPayments.length > 0) {
          // User has a verified payment, redirect to setup
          navigate("/setup");
          return;
        }
        
        // Check for active subscription
        const { data: subscriptions } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .limit(1);
        
        if (subscriptions && subscriptions.length > 0) {
          // User already has an active subscription, redirect to setup
          navigate("/setup");
          return;
        }
        
        // Check if the user has a pending payment
        const { data: pendingPayments } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "pending")
          .limit(1);
          
        if (pendingPayments && pendingPayments.length > 0) {
          setPaymentData(pendingPayments[0]);
        } else {
          // No pending payment found
          navigate("/payment");
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkPaymentStatus();
    
    // Set up real-time subscription to listen for payment status changes
    const channel = supabase
      .channel('payment-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${supabase.auth.getSession().then(({ data }) => data.session?.user.id)}`
        },
        (payload) => {
          console.log('Payment status changed:', payload);
          // If payment is verified, redirect to setup page
          if (payload.new.status === 'verified') {
            navigate('/setup');
            return;
          }
          
          // Update the payment data
          setPaymentData(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const refreshStatus = async () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-t-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-purple-50/50">
      <Navigation />
      <main className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Payment Verification Pending</h1>
            <p className="text-muted-foreground">Your payment is being verified by our team</p>
          </div>

          <div className="w-full max-w-lg mx-auto">
            <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Menu Plan</h2>
                <Badge variant="warning" className="rounded-full px-3 py-1 text-orange-500 bg-orange-100">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">${paymentData?.amount}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Payment Type:</span>
                  <span className="font-medium capitalize">{paymentData?.payment_type}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-orange-500">Pending Verification</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {paymentData ? new Date(paymentData.created_at).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <p className="text-yellow-800 text-sm">
                  Your payment is currently being verified by an administrator. Once verified, 
                  you'll gain access to all features. This process usually takes a few minutes.
                </p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={refreshStatus} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Refresh Status
                </Button>
                <Button 
                  onClick={() => navigate("/")} 
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PendingVerification;
