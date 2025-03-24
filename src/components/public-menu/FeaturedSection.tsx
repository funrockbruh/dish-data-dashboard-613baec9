import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
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
  if (featuredItems.length === 0) return null;
  return <section className="mb-6">
      <Carousel className="w-full">
        <CarouselContent>
          {featuredItems.map(item => <CarouselItem key={`featured-${item.id}`} className="relative">
              <div className="overflow-hidden rounded-lg">
                <img src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"} alt={item.name} className="w-full aspect-[16/9] object-cover" />
                
                <div className="absolute top-0 left-0 px-6 py-1 font-bold tracking-widest bg-black/20 shadow-[0_4px_10px_rgba(255,255,255,0.5)]  backdrop-blur-[10px] rounded-tl-[15px] rounded-br-[150px] ">
                  FEATURED
                </div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                  <h3 className="text-3xl font-bold text-center">{item.name}</h3>
                </div>
              </div>
            </CarouselItem>)}
        </CarouselContent>
      </Carousel>
    </section>;
};