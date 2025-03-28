
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CountdownTimerProps {
  expiryDate: Date;
}

export const CountdownTimer = ({ expiryDate }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [showTimer, setShowTimer] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTimeLeft = () => {
      const now = new Date();
      const timeDiff = expiryDate.getTime() - now.getTime();
      
      // Show timer when less than 1 minute remains
      if (timeDiff <= 60000 && timeDiff > 0) {
        setShowTimer(true);
        setTimeLeft(formatDistanceToNow(expiryDate, { addSuffix: true }));
      } else {
        setShowTimer(false);
      }
    };

    // Initial check
    checkTimeLeft();
    
    // Set up interval to update the timer
    const interval = setInterval(checkTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [expiryDate]);

  if (!showTimer) {
    return null;
  }

  return (
    <div 
      className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium cursor-pointer animate-pulse"
      onClick={() => navigate("/payment/manage")}
    >
      <Clock className="h-3 w-3" />
      <span>{timeLeft}</span>
    </div>
  );
};
