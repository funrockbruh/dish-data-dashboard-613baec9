
import { useRef } from "react";
import { Category, ThemeSettings } from "@/hooks/public-menu/types";

interface CategoriesSectionProps {
  categories: Category[];
  themeSettings?: ThemeSettings;
}

export const CategoriesSection = ({ categories, themeSettings }: CategoriesSectionProps) => {
  const carouselRef = useRef(null);
  
  // Get theme settings
  const template = themeSettings?.template || "template1";
  const isLightTheme = themeSettings?.isLightTheme !== false;
  
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

  // Adjust category item size and styling based on template
  const getCategoryItemStyle = () => {
    switch (template) {
      case "template2": // Modern Grid
        return "flex-none w-32";
      case "template3": // Elegant List
        return "flex-none w-40";
      case "template4": // Card View
        return "flex-none w-36";
      case "template5": // Compact Layout
        return "flex-none w-20";
      default: // Classic Menu
        return "flex-none w-24";
    }
  };

  // Adjust gradient overlay based on theme
  const getOverlayStyle = () => {
    if (isLightTheme) {
      return "absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/50 to-transparent";
    } else {
      return "absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent";
    }
  };

  return (
    <section className="mb-4">
      <div className={`flex overflow-x-auto hide-scrollbar gap-3 py-2 ${
        template === "template3" ? "justify-center" : ""
      }`}>
        {displayCategories.map((category) => (
          <div 
            key={category.id} 
            className={getCategoryItemStyle()}
            onClick={() => scrollToCategory(category.id)}
          >
            <div className={`aspect-square rounded-lg overflow-hidden relative cursor-pointer ${
              template === "template5" ? "rounded-full" : "rounded-lg"
            }`}>
              <img
                src={category.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className={getOverlayStyle()}></div>
              <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                <h3 className={`text-white font-medium ${
                  template === "template5" ? "text-xs" : "text-lg"
                }`}>
                  {category.name}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
