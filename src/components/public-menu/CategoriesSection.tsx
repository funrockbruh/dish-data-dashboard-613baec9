
import { useRef } from "react";
import { Category } from "@/hooks/public-menu/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface CategoriesSectionProps {
  categories: Category[];
}

export const CategoriesSection = ({ categories }: CategoriesSectionProps) => {
  const carouselRef = useRef(null);
  
  // If no categories exist, create some default ones for the UI display based on the image
  const displayCategories = categories.length ? categories : [
    { id: "1", name: "Burger", image_url: "/lovable-uploads/23802941-c54a-48b5-a0d5-e15fc791d6df.png" },
    { id: "2", name: "Sandwich", image_url: "/lovable-uploads/23802941-c54a-48b5-a0d5-e15fc791d6df.png" },
    { id: "3", name: "Platters", image_url: "/lovable-uploads/23802941-c54a-48b5-a0d5-e15fc791d6df.png" },
    { id: "4", name: "Salad", image_url: "/lovable-uploads/23802941-c54a-48b5-a0d5-e15fc791d6df.png" },
  ];

  if (displayCategories.length === 0) return null;

  return (
    <section className="mb-6">
      <Carousel
        ref={carouselRef}
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {displayCategories.map((category) => (
            <CarouselItem key={category.id} className="pl-4 md:basis-1/4 lg:basis-1/4">
              <div className="h-full">
                <div className="aspect-square rounded-lg overflow-hidden relative cursor-pointer">
                  <img
                    src={category.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-3xl font-bold">{category.name}</h3>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};
