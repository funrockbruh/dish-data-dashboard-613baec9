
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DebugInfoPanel } from "../debug/DebugInfoPanel";

interface NoMenuAvailableCardProps {
  restaurantName: string;
  restaurantId: string;
  debugInfo?: any;
}

export const NoMenuAvailableCard = ({ restaurantName, restaurantId, debugInfo }: NoMenuAvailableCardProps) => {
  return (
    <Card className="p-4 bg-gray-800 rounded-lg mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start gap-2 mb-3">
          <Info className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <h3 className="text-yellow-400 font-bold">No Menu Available</h3>
        </div>
        <p className="text-gray-200">
          {restaurantName} hasn't added any menu items or categories yet.
        </p>
        
        <DebugInfoPanel restaurantId={restaurantId} debugInfo={debugInfo} />
      </CardContent>
    </Card>
  );
};
