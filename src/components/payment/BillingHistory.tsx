
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface BillingHistoryProps {
  billingHistory: any[];
  subscriptionId?: string;
  onCancelSubscription: () => void;
}

export const BillingHistory = ({ 
  billingHistory, 
  subscriptionId, 
  onCancelSubscription 
}: BillingHistoryProps) => {
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <>
      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="billing-history" className="border-none">
          <AccordionTrigger className="text-blue-600 font-medium px-0 py-2">
            View billing history
          </AccordionTrigger>
          <AccordionContent>
            {billingHistory.length > 0 ? (
              <div className="space-y-2 mt-2">
                {billingHistory.map(payment => (
                  <div key={payment.id} className="border rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">${payment.amount}</p>
                      <p className="text-xs text-gray-500">{formatDate(payment.created_at)}</p>
                    </div>
                    <Badge className={
                      payment.status === "verified" 
                        ? "bg-green-100 text-green-800" 
                        : payment.status === "pending" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-red-100 text-red-800"
                    }>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No billing history available</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center text-red-500 border-red-200" 
        onClick={onCancelSubscription}
      >
        <Trash2 className="h-5 w-5 mr-2" />
        Cancel subscription
      </Button>
    </>
  );
};
