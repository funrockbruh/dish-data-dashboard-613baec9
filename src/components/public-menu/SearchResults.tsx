
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { MenuItem } from "@/hooks/public-menu/types";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

interface SearchResultsProps {
  isVisible: boolean;
  searchQuery: string;
  items: MenuItem[];
  formatPrice: (price: number) => string;
  onItemClick: (item: MenuItem) => void;
}

export const SearchResults = ({
  isVisible,
  searchQuery,
  items,
  formatPrice,
  onItemClick
}: SearchResultsProps) => {
  if (!isVisible || items.length === 0 || searchQuery.trim() === "") {
    return null;
  }

  return (
    <div className="bg-black/90 backdrop-blur-[15px] max-h-[70vh] overflow-y-auto border-x border-b border-gray-800 rounded-b-2xl">
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
                  <ImageWithSkeleton 
                    src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    fallbackClassName="rounded-lg"
                  />
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
