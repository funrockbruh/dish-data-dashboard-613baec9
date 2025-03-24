
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CategoryCard } from "./CategoryCard";
import { Category } from "./CategoryManager";

interface CategoryGridProps {
  categories: Category[];
  onAddCategory: () => void;
  onEditCategory: (index: number) => void;
}

export const CategoryGrid = ({ 
  categories, 
  onAddCategory, 
  onEditCategory 
}: CategoryGridProps) => {
  return (
    <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <button 
          onClick={onAddCategory} 
          className="aspect-square rounded-2xl flex items-center justify-center transition-colors bg-white border-2 border-dashed border-gray-300 hover:border-gray-400"
        >
          <Plus className="h-10 w-10 text-gray-400" />
        </button>

        {categories.map((category, index) => (
          <CategoryCard 
            key={index} 
            name={category.name} 
            imagePreview={category.imagePreview} 
            onEdit={() => onEditCategory(index)} 
          />
        ))}
      </div>
    </Card>
  );
};
