
import { MenuItem } from "@/hooks/public-menu/types";

interface SearchResultsProps {
  isVisible: boolean;
  searchQuery: string;
  items: MenuItem[];
  formatPrice: (price: number) => string;
  onItemClick: (item: MenuItem) => void;
  textColor?: string;
}

export const SearchResults = ({
  isVisible,
  searchQuery,
  items,
  formatPrice,
  onItemClick,
  textColor = "text-white"
}: SearchResultsProps) => {
  if (!isVisible || searchQuery.trim() === "" || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-black/50 backdrop-blur-[15px] p-4 border border-gray-800 rounded-b-2xl max-h-[60vh] overflow-y-auto hide-scrollbar">
      <div className="mb-2">
        <h3 className={`${textColor} text-lg font-medium`}>Search Results</h3>
        <p className="text-gray-400 text-sm">{items.length} items found</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center gap-4 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors"
            onClick={() => onItemClick(item)}
          >
            {item.image_url && (
              <img 
                src={item.image_url} 
                alt={item.name} 
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h4 className={`${textColor} font-medium`}>{item.name}</h4>
              {item.description && (
                <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
              )}
              <p className={`${textColor} font-bold mt-1`}>{formatPrice(item.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
