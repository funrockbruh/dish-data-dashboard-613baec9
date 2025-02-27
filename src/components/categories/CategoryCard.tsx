
import { Upload, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  name: string;
  imagePreview?: string;
  onEdit?: () => void;
}

export const CategoryCard = ({ name, imagePreview, onEdit }: CategoryCardProps) => {
  return (
    <Card 
      className="aspect-square relative rounded-2xl overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow bg-white border border-gray-200"
      onClick={onEdit}
    >
      {imagePreview ? (
        <>
          <img 
            src={imagePreview} 
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            {/* Centered Pencil Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 p-3 rounded-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <Pencil className="h-5 w-5 text-white" />
            </div>
            {/* Category Name at Bottom Center */}
            <div className="absolute bottom-4 inset-x-0 text-center">
              <h3 className="text-white text-xl font-black font-figtree px-4">
                {name}
              </h3>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-white flex items-center justify-center border-2 border-dashed border-gray-300">
          <Upload className="h-8 w-8 text-gray-400" />
        </div>
      )}
    </Card>
  );
};
