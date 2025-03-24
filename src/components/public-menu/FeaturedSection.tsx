
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { MenuItemDetailDialog } from "./MenuItemDetailDialog";
import { MenuItem, ThemeSettings } from "@/hooks/public-menu/types";

interface FeaturedSectionProps {
  featuredItems: MenuItem[];
  formatPrice: (price: number) => string;
  themeSettings?: ThemeSettings;
}

export const FeaturedSection = ({
  featuredItems,
  formatPrice,
  themeSettings
}: FeaturedSectionProps) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  if (featuredItems.length === 0) return null;

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedItem(null);
  };

  // Get styling based on template
  const template = themeSettings?.template || "template1";
  const isLightTheme = themeSettings?.isLightTheme !== false;

  // Adjust featured badge styling based on template and theme
  const getFeaturedBadgeStyle = () => {
    if (isLightTheme) {
      return "bg-white/70 text-gray-900 shadow-lg backdrop-blur-[5px]";
    }
    
    switch (template) {
      case "template2": // Modern Grid
        return "bg-gradient-to-r from-purple-500 to-blue-500 text-white";
      case "template3": // Elegant List
        return "bg-white/10 text-white backdrop-blur-[10px] border border-white/20";
      case "template4": // Card View
        return "bg-gray-900/80 text-white shadow-lg backdrop-blur-[5px]";
      case "template5": // Compact Layout
        return "bg-black/50 text-white text-xs";
      default:
        return "bg-black/20 shadow-[4px_4px_8px_rgba(255,255,255,0.5)] backdrop-blur-[10px] text-white";
    }
  };

  return (
    <section className="mb-6">
      <Carousel className="w-full">
        <CarouselContent>
          {featuredItems.map(item => (
            <CarouselItem 
              key={`featured-${item.id}`} 
              className="relative cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <div className="overflow-hidden rounded-lg">
                <img 
                  src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"} 
                  alt={item.name} 
                  className="w-full aspect-[16/9] object-cover" 
                />
                
                <div className={`absolute top-0 left-0 font-bold tracking-widest ${getFeaturedBadgeStyle()} rounded-tl-[35px] rounded-br-[150px] py-[6px] my-0 px-[15px] mx-[16px]`}>
                  FEATURED
                </div>
                
                <div className={`absolute inset-0 bg-gradient-to-t ${isLightTheme ? 'from-gray-900' : 'from-black'} via-black/50 to-transparent`}>
                  <h3 className={`text-3xl font-bold text-white absolute bottom-4 left-0 w-full text-center ${
                    template === "template5" ? "text-xl" : "text-3xl"
                  }`}>
                    {item.name}
                  </h3>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Item Detail Dialog */}
      <MenuItemDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDialog}
        item={selectedItem}
        formatPrice={formatPrice}
        themeSettings={themeSettings}
      />
    </section>
  );
};
