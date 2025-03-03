
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

  return (
    <section className="overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      <div className="flex space-x-4 py-2">
        {categories.map((category) => (
          <div key={category.id} className="flex-shrink-0 w-32 text-center">
            <div className="relative w-24 h-24 mx-auto mb-2">
              <img
                src={category.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"}
                alt={category.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold">{category.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};
