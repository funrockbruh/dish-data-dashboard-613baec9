
import { Plus } from "lucide-react";

interface AddFeaturedButtonProps {
  onClick: () => void;
}

export const AddFeaturedButton = ({ onClick }: AddFeaturedButtonProps) => {
  return (
    <div 
      className="bg-gray-200 rounded-xl aspect-video flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
      onClick={onClick}
    >
      <Plus className="h-16 w-16 text-gray-500" />
    </div>
  );
};
