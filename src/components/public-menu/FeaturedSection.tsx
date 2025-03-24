
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { MenuItemDetailDialog } from "./MenuItemDetailDialog";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string;
  is_featured: boolean;
}

interface FeaturedSectionProps {
  featuredItems: MenuItem[];
  formatPrice: (price: number) => string;
}

export const FeaturedSection = ({
  featuredItems,
  formatPrice
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
                <img src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"} alt={item.name} className="w-full aspect-[16/9] object-cover" />
                
                <div className="absolute top-0 left-0 font-bold tracking-widest bg-black/20 shadow-[4px_4px_8px_rgba(255,255,255,0.5)] backdrop-blur-[10px] rounded-tl-[35px] rounded-br-[150px] py-[6px] my-0 px-[15px] mx-[16px]">
                  FEATURED
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
                  <h3 className="text-3xl font-bold text-white absolute bottom-4 left-0 w-full text-center">{item.name}</h3>
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
      />
    </section>
  );
};
