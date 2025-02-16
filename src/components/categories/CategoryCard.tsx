
import { Upload, Pencil } from "lucide-react";

interface CategoryCardProps {
  name: string;
  imagePreview?: string;
  onEdit?: () => void;
}

export const CategoryCard = ({ name, imagePreview, onEdit }: CategoryCardProps) => {
  return (
    <div 
      className="aspect-square relative rounded-2xl overflow-hidden group cursor-pointer"
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
            <div className="absolute top-3 right-3 bg-white/10 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <Pencil className="h-4 w-4 text-white" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white text-xl font-black font-inter">
                {name}
              </h3>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <Upload className="h-8 w-8 text-gray-400" />
        </div>
      )}
    </div>
  );
};
