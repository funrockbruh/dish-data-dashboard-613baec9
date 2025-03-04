
import { NoMenuAvailableCard } from "./empty-state/NoMenuAvailableCard";
import { MenuCreationCard } from "./empty-state/MenuCreationCard";

interface EmptyMenuStateProps {
  restaurantId: string;
  restaurantName: string;
  debugInfo?: any;
}

export const EmptyMenuState = ({ restaurantId, restaurantName, debugInfo }: EmptyMenuStateProps) => {
  return (
    <div className="space-y-6">
      <NoMenuAvailableCard 
        restaurantId={restaurantId}
        restaurantName={restaurantName}
        debugInfo={debugInfo}
      />
      
      <MenuCreationCard />
    </div>
  );
};
