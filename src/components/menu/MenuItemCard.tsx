
import { Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  categoryName: string;
  onEdit: () => void;
}

export const MenuItemCard = ({ item, categoryName, onEdit }: MenuItemCardProps) => {
  const isMobile = useIsMobile();
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(item.price / 100);

  // Truncate the description for mobile view
  const getDisplayDescription = () => {
    if (!item.description) return "";
    
    if (isMobile) {
      // For mobile, show approximately 12 characters
      if (item.description.length > 12) {
        return item.description.substring(0, 12) + "...";
      }
    }
    return item.description;
  };

  return (
    <Card className="p-4 flex gap-4 items-center bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="w-20 h-20 rounded-lg overflow-hidden">
        {item.image_url ? (
          <ImageWithSkeleton
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            fallbackClassName="bg-gray-100"
          />
        ) : (
          <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg font-figtree truncate">{item.name}</h3>
            <p className="text-sm text-gray-500 font-inter">{categoryName}</p>
          </div>
          <p className="font-bold text-lg font-figtree whitespace-nowrap">{formattedPrice}</p>
        </div>
        {item.description && (
          <div className="relative mt-1">
            <p className="text-gray-600 text-sm font-inter truncate">{getDisplayDescription()}</p>
            {isMobile && item.description.length > 12 && (
              <div 
                className="absolute right-0 top-0 h-full w-8 pointer-events-none" 
                style={{ 
                  background: 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)' 
                }}
              ></div>
            )}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </Card>
  );
};
