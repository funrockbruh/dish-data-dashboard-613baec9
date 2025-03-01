
import { Plus } from "lucide-react";

interface AddFeaturedButtonProps {
  onClick: () => void;
}

export const AddFeaturedButton = ({ onClick }: AddFeaturedButtonProps) => {
  return (
    <div 
      className="bg-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-300 aspect-video flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="bg-green-500 rounded-full p-2">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <p className="text-gray-500 font-medium">Add Featured Item</p>
      </div>
    </div>
  );
};
