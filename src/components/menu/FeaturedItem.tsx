
import { MenuItem } from "@/hooks/use-featured-items";

interface FeaturedItemProps {
  item: MenuItem;
  onToggle: (item: MenuItem) => void;
}

export const FeaturedItem = ({ item, onToggle }: FeaturedItemProps) => {
  return (
    <div 
      className="relative rounded-xl overflow-hidden cursor-pointer"
      onClick={() => onToggle(item)}
    >
      <img 
        src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"} 
        alt={item.name}
        className="w-full aspect-video object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <div className="w-6 h-1 bg-amber-700 rounded-full"></div>
        </div>
        <h3 className="text-white text-4xl font-bold mt-6">{item.name}</h3>
      </div>
    </div>
  );
};
