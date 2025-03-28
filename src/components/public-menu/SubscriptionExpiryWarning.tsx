
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle } from "lucide-react";

interface SubscriptionExpiryWarningProps {
  restaurantName: string;
  expiryDate: string;
}

export const SubscriptionExpiryWarning = ({ 
  restaurantName, 
  expiryDate 
}: SubscriptionExpiryWarningProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <Alert className="bg-red-50 border-red-300 text-red-800">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <div className="w-full">
          <AlertTitle className="text-lg font-semibold flex items-center justify-between">
            <span>Subscription Expired</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsVisible(false)}
              className="text-red-600 hover:text-red-700 hover:bg-red-100 -mr-2"
            >
              Dismiss
            </Button>
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="font-medium">{restaurantName} needs to renew their subscription.</p>
            <div className="flex items-center mt-2 text-red-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>This menu will be deleted in {formatTimeLeft()}</span>
            </div>
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};
