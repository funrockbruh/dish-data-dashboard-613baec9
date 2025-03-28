
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const PlanCard = () => {
  return (
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
  );
};
