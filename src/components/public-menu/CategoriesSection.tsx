
import { useRef } from "react";
import { Category } from "@/hooks/public-menu/types";

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

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="mb-4">
      <div className="flex overflow-x-auto hide-scrollbar gap-3 py-2">
        {displayCategories.map((category) => (
          <div 
            key={category.id} 
            className="flex-none w-24"
            onClick={() => scrollToCategory(category.id)}
          >
            <div className="aspect-square rounded-lg overflow-hidden relative cursor-pointer">
              <img
                src={category.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                <h3 className="text-white text-lg font-medium">{category.name}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
