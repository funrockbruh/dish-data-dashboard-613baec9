
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const NoSubscription = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 text-center">
      <h2 className="text-lg font-medium mb-4">No Active Subscription</h2>
      <p className="text-gray-600 mb-4">You don't have an active subscription at the moment.</p>
      <Button onClick={() => navigate("/payment")}>Subscribe Now</Button>
    </div>
  );
};
