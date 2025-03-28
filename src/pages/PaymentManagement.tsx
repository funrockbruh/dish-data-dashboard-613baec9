import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, CreditCard, Check, ChevronDown, ChevronUp, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, addMinutes } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

interface SubscriptionData {
  id: string;
  status: string;
  plan: string;
  start_date: string;
  end_date: string;
  payment_type?: string;
  created_at: string;
}

const PaymentManagement = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wantsQrCode, setWantsQrCode] = useState(false);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [testRenewalDate, setTestRenewalDate] = useState(new Date());

  useEffect(() => {
    setTestRenewalDate(addMinutes(new Date(), 2));
    
    const fetchSubscriptionData = async () => {
      try {
        setIsLoading(true);
        const {
          data: sessionData
        } = await supabase.auth.getSession();
        if (!sessionData.session) {
          navigate("/");
          return;
        }
        const userId = sessionData.session.user.id;

        // 1. First, check if the user has verified payments
        const {
          data: verifiedPayments,
          error: paymentsError
        } = await supabase.from("payments").select("*").eq("user_id", userId).eq("status", "verified").order("created_at", {
          ascending: false
        });
        if (paymentsError) {
          console.error("Error fetching verified payments:", paymentsError);
          return;
        }
        let hasVerifiedPayment = verifiedPayments && verifiedPayments.length > 0;

        // 2. Fetch subscriptions if user has verified payments
        if (hasVerifiedPayment) {
          // Try to fetch active subscription
          const {
            data: subscriptionData,
            error: subscriptionError
          } = await supabase.from("subscriptions").select("*").eq("user_id", userId).eq("status", "active").order("created_at", {
            ascending: false
          }).limit(1).single();
          if (subscriptionError) {
            if (subscriptionError.code !== 'PGRST116') {
              // No rows returned
              console.error("Error fetching subscription:", subscriptionError);
            } else {
              // If no active subscription, create one based on verified payment
              const latestPayment = verifiedPayments[0];
              const endDate = new Date();
              endDate.setFullYear(endDate.getFullYear() + 1); // Assuming 1-year subscription

              const subscriptionDetails = {
                user_id: userId,
                payment_id: latestPayment.id,
                plan: latestPayment.details?.plan || "menu_plan",
                price: latestPayment.amount,
                start_date: latestPayment.created_at,
                end_date: endDate.toISOString(),
                status: "active"
              };
              const {
                data: newSubscription,
                error: createError
              } = await supabase.from("subscriptions").insert(subscriptionDetails).select().single();
              if (createError) {
                console.error("Error creating subscription:", createError);
              } else if (newSubscription) {
                setSubscription({
                  ...newSubscription,
                  payment_type: latestPayment.payment_type
                });
              }
            }
          } else if (subscriptionData) {
            setSubscription(subscriptionData);

            // Look up payment information for this subscription
            if (subscriptionData.payment_id) {
              const {
                data: paymentData
              } = await supabase.from("payments").select("payment_type").eq("id", subscriptionData.payment_id).single();
              if (paymentData) {
                setSubscription({
                  ...subscriptionData,
                  payment_type: paymentData.payment_type
                });
              }
            }
          }
        }

        // 3. Fetch billing history (all payments for this user)
        const {
          data: paymentsHistory
        } = await supabase.from("payments").select("*").eq("user_id", userId).order("created_at", {
          ascending: false
        });
        if (paymentsHistory) {
          setBillingHistory(paymentsHistory);
        }

        // 4. Set QR code preference based on latest payment
        if (verifiedPayments && verifiedPayments.length > 0) {
          setWantsQrCode(verifiedPayments[0].details?.has_qr_code || false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load subscription information");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscriptionData();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatDateTime = (date: Date) => {
    try {
      return format(date, "MMMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    try {
      const {
        error
      } = await supabase.from("subscriptions").update({
        status: "cancelled"
      }).eq("id", subscription.id);
      if (error) throw error;
      toast.success("Subscription cancelled successfully");
      setSubscription({
        ...subscription,
        status: "cancelled"
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription");
    }
  };

  const handleUpdatePaymentMethod = () => {
    toast.info("Payment method update feature coming soon");
  };

  const handleToggleQrCode = async (value: boolean) => {
    setWantsQrCode(value);
    try {
      // Update the latest payment's details with QR code preference
      if (billingHistory.length > 0 && billingHistory[0].status === "verified") {
        const latestPayment = billingHistory[0];
        const updatedDetails = {
          ...latestPayment.details,
          has_qr_code: value
        };
        const {
          error
        } = await supabase.from("payments").update({
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

  const handleRenewSubscription = () => {
    navigate("/payment");
    toast.info("Redirecting to subscription renewal");
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-t-4 border-blue-500 rounded-full animate-spin"></div>
      </div>;
  }

  const hasActiveSubscription = subscription || billingHistory.length > 0 && billingHistory.some(payment => payment.status === "verified");
  return <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Payment Management</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6">
        {hasActiveSubscription ? <>
            {/* Subscription Details Card */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Subscription Details</h2>
                <Badge className={subscription?.status === "active" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}>
                  {subscription?.status === "active" ? "Active" : "Verified"}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Subscribed On</p>
                  <p className="font-medium">{subscription?.start_date ? formatDate(subscription.start_date) : billingHistory.length > 0 ? formatDate(billingHistory[0].created_at) : "Recent"}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Next Renewal</p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {subscription?.end_date ? formatDate(subscription.end_date) : formatDateTime(testRenewalDate)}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      onClick={handleRenewSubscription}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Renew
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-600 text-sm mb-2">Payment Method</p>
                  <div className="flex items-center">
                    <div className="bg-blue-500 text-white p-2 rounded mr-3">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <span className="font-medium">
                      {subscription?.payment_type ? `Pay in ${subscription.payment_type}` : billingHistory.length > 0 ? `Pay in ${billingHistory[0].payment_type}` : "Cash"}
                    </span>
                  </div>
                  <button onClick={handleUpdatePaymentMethod} className="text-purple-600 font-medium mt-2 flex items-center">
                    Update <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Available Plans Card */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
              <h2 className="text-lg font-medium mb-4">Available Plans</h2>
              
              <div className="border border-gray-200 p-4 rounded-lg relative mb-4">
                <div className="absolute right-4 top-4">
                  <div className="w-5 h-5 rounded-full border-2 border-purple-500 flex items-center justify-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
                
                <h3 className="font-medium">Menu</h3>
                <p className="text-gray-600 text-sm">Perfect for restaurants</p>
                
                <p className="text-2xl font-bold mt-3 mb-3">$100<span className="text-sm text-gray-500 font-normal">/year</span></p>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Unlimited menu items</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Basic categories</span>
                  </div>
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  Current Plan
                </Button>
              </div>
            </div>
            
            {/* QR Code Option */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
              <h2 className="text-lg font-medium mb-4">Do you want a unique QR code?</h2>
              
              <div className="flex space-x-4">
                <Button variant={!wantsQrCode ? "default" : "outline"} className={!wantsQrCode ? "bg-white border-2 border-gray-200 text-black" : ""} onClick={() => handleToggleQrCode(false)}>
                  No
                </Button>
                <Button variant={wantsQrCode ? "default" : "outline"} className={wantsQrCode ? "bg-white border-2 border-gray-200 text-black" : ""} onClick={() => handleToggleQrCode(true)}>
                  Yes
                </Button>
              </div>
            </div>
            
            {/* Billing History & Cancel */}
            <Accordion type="single" collapsible className="mb-6">
              <AccordionItem value="billing-history" className="border-none">
                <AccordionTrigger className="text-blue-600 font-medium px-0 py-2">
                  View billing history
                </AccordionTrigger>
                <AccordionContent>
                  {billingHistory.length > 0 ? <div className="space-y-2 mt-2">
                      {billingHistory.map(payment => <div key={payment.id} className="border rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">${payment.amount}</p>
                            <p className="text-xs text-gray-500">{formatDate(payment.created_at)}</p>
                          </div>
                          <Badge className={payment.status === "verified" ? "bg-green-100 text-green-800" : payment.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                            {payment.status}
                          </Badge>
                        </div>)}
                    </div> : <p className="text-gray-500">No billing history available</p>}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <Button variant="outline" className="w-full flex items-center justify-center text-red-500 border-red-200" onClick={handleCancelSubscription}>
              <Trash2 className="h-5 w-5 mr-2" />
              Cancel subscription
            </Button>
          </> : <div className="bg-white rounded-xl shadow-sm p-5 text-center">
            <h2 className="text-lg font-medium mb-4">No Active Subscription</h2>
            <p className="text-gray-600 mb-4">You don't have an active subscription at the moment.</p>
            <Button onClick={() => navigate("/payment")}>Subscribe Now</Button>
          </div>}
      </div>
    </div>;
};

export default PaymentManagement;
