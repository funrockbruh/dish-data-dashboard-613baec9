
import { 
  Carousel,
  CarouselContent,
  CarouselItem 
} from "@/components/ui/carousel";

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

export const FeaturedSection = ({ featuredItems, formatPrice }: FeaturedSectionProps) => {
  if (featuredItems.length === 0) return null;

  return (
    <section>
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <h2 className="text-lg font-bold tracking-wider uppercase bg-black bg-opacity-60 px-2 py-1">
            FEATURED
          </h2>
        </div>
        
        <Carousel>
          <CarouselContent>
            {featuredItems.map((item) => (
              <CarouselItem key={`featured-${item.id}`}>
                <div className="relative">
                  <img 
                    src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"}
                    alt={item.name}
                    className="w-full aspect-video object-cover rounded-xl"
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-3xl font-bold text-white">{item.name}</h3>
                    <p className="text-white text-xl">{formatPrice(item.price)}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};
