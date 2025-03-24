
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { MenuItem } from "@/hooks/public-menu/types";

interface SearchResultsProps {
  isVisible: boolean;
  searchQuery: string;
  items: MenuItem[];
  formatPrice: (price: number) => string;
  onItemClick: (item: MenuItem) => void;
  isLightTheme?: boolean;
}

export const SearchResults = ({
  isVisible,
  searchQuery,
  items,
  formatPrice,
  onItemClick,
  isLightTheme = true
}: SearchResultsProps) => {
  if (!isVisible || items.length === 0 || searchQuery.trim() === "") {
    return null;
  }

  return (
    <div className={`${isLightTheme ? 'bg-white/90 border-gray-200' : 'bg-black/90 border-gray-800'} backdrop-blur-[15px] max-h-[70vh] overflow-y-auto border-x border-b rounded-b-2xl`}>
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3">
          {items.map(item => (
            <div 
              key={item.id} 
              className="overflow-hidden rounded-lg cursor-pointer"
              onClick={() => onItemClick(item)}
            >
              <div className="relative w-full">
                <AspectRatio ratio={4/3}>
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full ${isLightTheme ? 'bg-gray-200' : 'bg-gray-800'} flex items-center justify-center`}>
                      <span className={`${isLightTheme ? 'text-gray-600' : 'text-gray-400'} text-xs`}>No image</span>
                    </div>
                  )}
                </AspectRatio>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                  <div className="flex justify-between items-center">
                    <p className="text-white text-sm font-medium truncate flex-1">{item.name}</p>
                    <p className="text-white text-xs whitespace-nowrap ml-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
