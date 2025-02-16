
import { Upload } from "lucide-react";

interface CategoryCardProps {
  name: string;
  imagePreview?: string;
}

export const CategoryCard = ({ name, imagePreview }: CategoryCardProps) => {
  return (
    <div className="aspect-square relative rounded-2xl overflow-hidden group">
      {imagePreview ? (
        <>
          <img 
            src={imagePreview} 
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4">
            <h3 className="text-white text-xl font-semibold font-inter">
              {name}
            </h3>
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
