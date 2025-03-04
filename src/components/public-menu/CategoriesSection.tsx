
interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

interface CategoriesSectionProps {
  categories: Category[];
}

export const CategoriesSection = ({ categories }: CategoriesSectionProps) => {
  if (categories.length === 0) return null;

  // If no categories exist, create some default ones for the UI display based on the image
  const displayCategories = categories.length ? categories : [
    { id: "1", name: "Burger", image_url: "/lovable-uploads/87c4ab9d-1a21-4cbe-b0d9-0076affc2788.png" },
    { id: "2", name: "Sandwich", image_url: "/lovable-uploads/87c4ab9d-1a21-4cbe-b0d9-0076affc2788.png" },
    { id: "3", name: "Platters", image_url: "/lovable-uploads/87c4ab9d-1a21-4cbe-b0d9-0076affc2788.png" },
    { id: "4", name: "Salad", image_url: "/lovable-uploads/87c4ab9d-1a21-4cbe-b0d9-0076affc2788.png" },
  ];

  return (
    <section className="mb-6">
      <div className="flex overflow-x-auto hide-scrollbar gap-4 py-2">
        {displayCategories.map((category) => (
          <div key={category.id} className="flex-none w-24">
            <div className="relative rounded-md overflow-hidden">
              <div className="aspect-square overflow-hidden bg-gray-700 relative">
                <img
                  src={category.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"}
                  alt={category.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute bottom-0 left-0 w-full p-2 text-center">
                  <h3 className="text-white font-bold text-sm">{category.name}</h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
