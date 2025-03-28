import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle } from "lucide-react";

interface SubscriptionExpiryWarningProps {
  restaurantName: string;
  expiryDate: string;
}

const TIMER_DURATION = 300; // 5 minutes in seconds
const TIMER_KEY = 'menu_deletion_timer';

export const SubscriptionExpiryWarning = ({ 
  restaurantName, 
  expiryDate 
}: SubscriptionExpiryWarningProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    // Try to load timer from localStorage to persist across refreshes
    const savedTimer = localStorage.getItem(TIMER_KEY);
    const savedExpiryDate = localStorage.getItem(`${TIMER_KEY}_expiry`);
    
    // If we have a saved timer with the same expiry date, use it
    if (savedTimer && savedExpiryDate === expiryDate) {
      const parsedTime = parseInt(savedTimer, 10);
      return parsedTime > 0 ? parsedTime : TIMER_DURATION;
    }
    
    // Otherwise start with the full duration
    return TIMER_DURATION;
  });

  useEffect(() => {
    // Save the expiry date for comparison
    localStorage.setItem(`${TIMER_KEY}_expiry`, expiryDate);
    
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime <= 1 ? 0 : prevTime - 1;
        
        // Save to localStorage for persistence
        localStorage.setItem(TIMER_KEY, newTime.toString());
        
        if (newTime <= 0) {
          clearInterval(interval);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryDate]);

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
