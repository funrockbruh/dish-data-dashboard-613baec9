
import { Utensils, Search, Menu } from "lucide-react";

interface PublicMenuHeaderProps {
  restaurantName: string | undefined;
  logoUrl: string | null;
}

export const PublicMenuHeader = ({ restaurantName, logoUrl }: PublicMenuHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 bg-black border-b border-gray-800 p-4">
      <div className="flex items-center justify-between">
        <button className="p-2 rounded-full">
          <Search className="h-8 w-8 text-white" />
        </button>
        
        {logoUrl ? (
          <div className="flex-1 flex justify-center">
            <img 
              src={logoUrl} 
              alt={restaurantName} 
              className="h-16 w-16 rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="flex-1 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center">
              <Utensils className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        )}
        
        <button className="p-2 rounded-full">
          <Menu className="h-8 w-8 text-white" />
        </button>
      </div>
      
      {/* Restaurant name display */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">{restaurantName}</h1>
      </div>
    </header>
  );
};
